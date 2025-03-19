/*
EX 1
*/

//Verificar que un restaurante puede tener más de un inspection
db.inspections.aggregate([
    {
        $group: { _id: "$restaurant_id", count: { $sum: 1 }, }
    },
    {
        $sort: { count: -1 }
    },
])

//Contar todas los documentos de la collection inspections que tienen el campo de restaurant_id
db.inspections.countDocuments({restaurant_id: {$exists: true}});

//Contar el total de documentos dentro de la collection inspections
db.inspections.countDocuments();

//Conseguir los diferentes valores de "result"
db.inspections.distinct("result");

//Contar las inspecciones con el campo date
db.inspections.countDocuments({date: {$exists: true}});

//Conseguir los diferentes valores de "rating"
db.restaurants.distinct("rating")


//JSON SQUEMA
db.createCollection("inspections", {
validator: {
    $jsonSchema: {
    bsonType: "object",
    required: ["restaurant_id", "date", "result"],
    properties: {
        restaurant_id: {
        bsonType: "string",
        description: "Debe ser un string y es requerido para asociar la inspección a un restaurante."
        },
        date: {
        bsonType: "date",
        description: "Debe ser una fecha y es requerido para determinar la validez de la inspección."
        },
        result: {
        bsonType: "string",
        enum: ["Fail", "No Violation Issued", "Pass", "Violation Issued", "Warning Issued"],
        description: "Debe ser uno de los valores predefinidos y es requerido."
        }
    }
    }
}
});
  
db.createCollection("restaurants", {
validator: {
    $jsonSchema: {
    bsonType: "object",
    properties: {
        rating: {
        bsonType: ["number", "null"],
        minimum: 1,
        maximum: 10,
        description: "Debe ser un número entre 1 y 10, o null si no está calificado aún."
        }
    }
    }
}
});
  
  

/*
EX 2
*/

// Restaurantes de un tipo de comida en especifico
db.restaurants.aggregate([
    {
      $match: {
          type_of_food : "Chinese"
      }  
    },
    {
        $project: {
            "_id" : 0,
            "name" : 1,
        }
    }
])

//Inspecciones con violaciones, ordenadas por fecha
db.inspections.aggregate([
    {
      $match: {
          result : "Violation Issued",
      }  
    },
    {
        $addFields: {
            "ISOFormatDate" :{
                $dateFromString: {
                  dateString: "$date",
                  format : "%b %d %Y"
                }
            }
        }
    },
    {
        $sort: {
            ISOFormatDate : 1
        }
    }
])

//Restaurantes con rating mayor a 4
db.restaurants.find({rating : {$gt: 4, $ne: 'Not yet rated'}})

/*
EX 3
*/

// Verificar el rating máximo no nulo
use("restaurant_db");
db.restaurants.aggregate([
    {
        $match: {
            rating: { $nin: [null, "", "Not yet rated"] }
        }
    },
    {
        $group: {
            _id: null,
            maxField: { $max: "$rating" }
        }
    }
])

// Agrupar restaurantes por tipo de comida y calificación promedio
use("restaurant_db");
db.restaurants.aggregate([
    {
        $match: {
            rating: { $nin: [null, "", "Not yet rated"] }
        }
    },
    {
        $group: {
            _id: "$type_of_food",
            number_of_restaurants: { $sum: 1 },
            average_rating: { $avg: "$rating" }
        }
    }
])

// Número de inspecciones por resultado y porcentajes
use("restaurant_db");
db.inspections.aggregate([
    {
        $group: {
            _id: "$result",
            inspections_by_result: { $sum: 1 }
        },
    },
    {
        $group: {
            _id: null,
            total_inspections: { $sum: "$inspections_by_result" },
            result: { $push: { name: "$_id", inspections_by_result: "$inspections_by_result" } }
        }
    },
    {
        $unwind: "$result"
    },
    {
        $project: {
            _id: 0,
            name: "$result.name",
            inspections_by_result: "$result.inspections_by_result",
            percentage: { $multiply: [{ $divide: ["$result.inspections_by_result", "$total_inspections"] }, 100] }
        }
    }
])

//Lookup originl para unir restaurantes con inspecciones
use("restaurant_db");
db.restaurants.aggregate([
    {
        "$lookup": {
            "from": "inspections",
            "localField": "_id",
            "foreignField": "restaurant_id",
            "as": "inspection_history"
        }
    }
]) // devuele una arra vacío. Hay un problema con el match de los campos

// Verificar el tipo de dato de _id
use("restaurant_db");
db.restaurants.aggregate([
    {
        $project: {
            _id: 1,
            type: { $type: "$_id" } // devuelve "objectId"
        }
    }
])

// Verificar el tipo de dato de restaurant_id
use("restaurant_db");
db.inspections.aggregate([
    {
        $project: {
            restaurant_id: 1,
            type: { $type: "$restaurant_id" } // devuelve "string"
        }
    }
])

// Lookup con restaurant_id como string
use("restaurant_db");
db.restaurants.aggregate([
    {
        $addFields: {
            //toString porque el foreignField es un string
            restaurant_id: { $toString: "$_id" }
        }

    },
    {
        "$lookup": {
            "from": "inspections",
            "localField": "restaurant_id",
            "foreignField": "restaurant_id",
            "as": "inspection_history"
        }
    },
    { $out: "restaurants_inspections" } // guarda el resultado en una nueva collection
])


//Tareas avanzadas - NUEVA COLLECTION
db.restaurants.aggregate([
    {
        $addFields: {
            restaurant_id: { $toString: "$_id" }
        }
    },
    {
        "$lookup": {
            "from": "inspections",
            "localField": "restaurant_id",
            "foreignField": "restaurant_id",
            "as": "inspection_history"
        }
    },
    {
        $set: {
            inspection_history: {
                $map: {//Modificar estructura de inpection
                    input: "$inspection_history",
                    as: "insp",
                    in: {
                        id: "$$insp.id",
                        certificate_number: "$$insp.certificate_number",
                        business_name: "$$insp.business_name",
                        date: {//Pasar a formato ISO
                            $dateFromString: {
                                dateString: "$$insp.date",
                                format: "%b %d %Y"
                            }
                        },
                        result: "$$insp.result",
                        sector: "$$insp.sector"
                    }
                }
            }
        }
    },
    {
        //Sacar del pipeline lo qeu no queremos
        $unset: ["restaurant_id", "inspection_history.restaurant_id", "inspection_history.address"]
    },
    {
        $addFields: {//Añadimos el rating con addFields
            rating: {//Solo añadir si se trata de un valor númerico
                $cond: {
                    if: { $ne: [{ $type: "$rating" }, "string"] },
                    then: "$rating",
                    else: "$$REMOVE" //mongo 3.6 no muestra el campo -> remove
                }
            }
        }
    },
    {
        $out: "restaurants_with_inspections" //Creamos una nueva colección
    }
 ]);
 
 //Ordenar inspeccions a partir de la fecha
 db.restaurants_with_inspections.aggregate([
    {
      $match : { name : "2 Treat U"}
    },
    {
        $unwind: "$inspection_history"
    },
    {
        $sort: { "inspection_history.date": -1 }
    },
    {
        $project: {
            _id: 1,
               inspection_history: 1
        }
    }
])