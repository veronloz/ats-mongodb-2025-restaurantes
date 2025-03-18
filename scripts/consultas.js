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
db.restaurants.find({rating : {$gt: 4}})

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