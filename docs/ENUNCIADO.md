# PLAB 06/03/2025 TEMA 1 MongoDB - Arquitectura y Tecnologías del Software (ATS)

*También podéis encontrar el enunciado de la práctica en formato PDF en el Campus Virtual*

## Introducción

En esta práctica pondrás a prueba los conocimientos adquiridos sobre bases de datos NoSQL utilizando MongoDB. Diseñarás un esquema adecuado, justificarás tus decisiones técnicas en términos de diseño, cardinalidad, rendimiento y tipos de índices, y realizarás consultas avanzadas utilizando el Aggregation Framework.

## Organización

La práctica se divide en dos sesiones:

- **06/03/2025**: Explicación, análisis del dataset, diseño inicial. Trabajo en grupo.
- **20/03/2025**: Exposición de los resultados en una presentación de máximo 10 minutos.


## Proyecto: Gestión de Restaurantes e Inspecciones

Para esta práctica, trabajaremos con un dataset que contiene información sobre restaurantes y sus inspecciones sanitarias. Se utilizarán dos colecciones en la base de datos:

### Colección `restaurants` (Información general de los restaurantes)

```json
{
    "_id": ObjectId("55f14312c7447c3da7051b26"),
    "name": ".CN Chinese",
    "address": {
        "street": "228 City Road",
        "city": "Cardiff",
        "postcode": "CF24 3JH"
    },
    "rating": 5,
    "type_of_food": "Chinese",
    "url": "http://www.just-eat.co.uk/restaurants-cn-chinese-cardiff/menu"
}
```

### Colección `inspections` (Historial de inspecciones de cada restaurante)

```json
{
    "_id": ObjectId("56d61033a378eccde8a8354f"),
    "restaurant_id": ObjectId("55f14312c7447c3da7051b26"),
    "certificate_number": 9278806,
    "date": "2015-02-20",
    "result": "No Violation Issued",
    "sector": "Food Safety",
    "address": {
        "city": "Cardiff",
        "postcode": "CF24 3JH",
        "street": "228 City Road"
    }
}
```

## Tareas Obligatorias (Hasta 4 puntos)

Estas tareas deben realizarse obligatoriamente para aprobar la práctica:

### 1. Diseño del esquema de la base de datos

- Analizar la estructura de los datos y determinar el tipo de relación entre restaurantes e inspecciones (One-to-Few, One-to-Many, One-to-Millions).
- Justificar la elección de referencias (`restaurant_id`) en lugar de documentos embebidos.
También puedes decidir crear una nueva collection que no utilice las referencias e incorpore los documentos embebidos.
- Definir un esquema de validación para ambas colecciones.

### 2. Implementación de consultas en MongoDB

- Buscar todos los restaurantes de un tipo de comida específico (ej. "Chinese").
- Listar las inspecciones con violaciones, ordenadas por fecha.
- Encontrar restaurantes con una calificación superior a 4.

### 3. Uso de agregaciones

- Agrupar restaurantes por tipo de comida y calcular la calificación promedio.
- Contar el número de inspecciones por resultado y mostrar los porcentajes.
- Unir restaurantes con sus inspecciones utilizando `$lookup`.

Ejemplo de `$lookup`:

```javascript
db.restaurants.aggregate([
    {
        "$lookup": {
            "from": "inspections",
            "localField": "_id",
            "foreignField": "restaurant_id",
            "as": "inspection_history"
        }
    }
]);
```

## Tareas Avanzadas (Hasta 6 puntos)

Estas tareas son más complejas y exploratorias y por lo tanto más abiertas:

### 1. Optimización del rendimiento

- Identificar las posibles consultas más frecuentes.
- Implementar índices adecuados para esas consultas.
- Comparar el rendimiento antes y después de crear los índices utilizando `explain()`.

### 2. Estrategias de escalabilidad

- Proponer una estrategia de sharding adecuada para este dataset.
- Diseñar un esquema de replicación para alta disponibilidad.
- Analizar posibles cuellos de botella y soluciones.

*El punto 2 es correcto si solo se implementa a nivel teorico justificando las decisiones de diseño*

## Tarea Opcional Avanzada (Hasta 2 puntos extra)

Implementar una búsqueda semántica utilizando embeddings. Para esta tarea podéis usar alguna de las siguientes opciones:

- Utilizar Atlas Vector Search directamente en MongoDB Atlas (si elegís trabajar en la nube).
- Implementar la generación de embeddings con LangChain (https://www.langchain.com/) almacenando los embeddings en MongoDB.
- Podéis proponer una prueba de concepto utilizando la llamada vía API a un LLM (Large Language Model) para probar la funcionalidad de la búsqueda y generar una respuesta acorde con la consulta del usuario.


Ejemplo de consulta semántica con `vectorSearch`:

```javascript
db.inspections.aggregate([
   {
     "$vectorSearch": {
       "queryVector": [0.1, 0.3, 0.9, ...],
       "path": "embedding",
       "numCandidates": 100,
       "limit": 10,
       "index": "vector_index"
     }
   }
]);
```


## Entrega

La entrega se realizará mediante un Pull Request en GitHub, con la siguiente estructura:

```plaintext
ats-mongodb-2025-restaurantes/
├── datasets/
│   ├── restaurants.json
│   └── inspections.json
├── scripts/
│   └── consultas.js
├── docs/
│   ├── ENUNCIADO.md
│   ├── GUIA_PRACTICA.md
│   ├── INSTRUCCIONES_ENTREGA.md
└── README.md
```

Y vía Campus Virtual habrá que entregar en un .ZIP con el informe en PDF y la presentación que se realizará el 20/03. El formato del informe, al igual que en las entregas de problemas, es libre pero si que tendrá que contener los siguientes puntos:

1. Justificación del diseño de la base de datos.
2. Explicación de las consultas implementadas con sus resultados.
3. Decisiones técnicas sobre índices, validaciones y rendimiento.
4. Capturas de pantalla con ejemplos de ejecución.
5. Código fuente de consultas y scripts utilizados.

## Evaluación

- **Tareas obligatorias**: Hasta 4 puntos.
- **Tareas avanzadas**: Hasta 6 puntos.
- **Tarea opcional (búsqueda semántica)**: Hasta 2 puntos extra.

**Nota mínima para aprobar**: 4 puntos en las tareas obligatorias.

## Fecha Límite

- **20/03/2025 a las 23:59**

