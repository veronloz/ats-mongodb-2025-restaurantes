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