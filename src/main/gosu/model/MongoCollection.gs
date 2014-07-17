package model

uses com.mongodb.*
uses java.util.Map
uses util.iterable.TransformIterable

class MongoCollection {

  var _collection : DBCollection

  construct(collectionName : String) {
    _collection = Database.INSTANCE.getCollection(collectionName)
  }

 /* Automatically sorts from oldest to newest */
  function find(ref : Map<Object, Object>) : TransformIterable<Map<Object,Object>> {
     return new TransformIterable<Map<Object,Object>>(
         _collection.find(new BasicDBObject(ref))
                            .sort(new BasicDBObject({'_id' -> -1})),
                             \ o  -> (o as BasicDBObject))
  }

  /* Automatically sorts from oldest to newest */
  function find(ref : Map<Object, Object>, keys : Map<Object, Object>) : TransformIterable<Map<Object,Object>> {
    return new TransformIterable<Map<Object,Object>>(
        _collection.find(new BasicDBObject(ref),
                          new BasicDBObject(keys))
                          .sort(new BasicDBObject({'_id' -> -1})),
                          \ o -> (o as BasicDBObject))

  }

  /* Automatically sorts from oldest to newest */
  function find() : TransformIterable<Map<Object,Object>> {
    return new TransformIterable<Map<Object,Object>>(
        _collection.find().sort(new BasicDBObject({'_id' -> -1})), \ o -> (o as BasicDBObject))
  }

  property get Name() : String {
    return _collection.Name
  }

  function queryOr(values : List<String>, key : String) : TransformIterable<Map<Object,Object>> {
    var document = new BasicDBObject()
    var qb = new QueryBuilder()
    var list : List<DBObject> = {}
    for (item in values) {
      var o = new BasicDBObject()
      o[key] = item
      list.add(o)
    }
    qb.or(list.toTypedArray())
    document.putAll(qb.get())
    return new TransformIterable<Map<Object,Object>>(
        _collection.find(document).sort(new BasicDBObject({'_id' -> -1})), \ o -> (o as BasicDBObject))
  }

  function queryNot(key : String, value : String) : TransformIterable<Map<Object,Object>> {
    var document = new BasicDBObject()
    var qb = new QueryBuilder()
    qb.put(key).notEquals(value)
    document.putAll(qb.get())
    return new TransformIterable<Map<Object,Object>>(
        _collection.find(document).sort(new BasicDBObject({'_id' -> -1})), \ o -> (o as BasicDBObject))
  }


  function findOne(ref : Map<String, Object>) : DBObject {
    return _collection.findOne(ref)
  }

  function insert(o : DBObject) : WriteResult {
    return _collection.insert(o, WriteConcern.ACKNOWLEDGED)
  }

  function insert(o : Map<String, Object>) : WriteResult {
    return _collection.insert(new BasicDBObject(o), WriteConcern.ACKNOWLEDGED)
  }

  function insert(objects : List<Map<String, Object>>) : WriteResult {
    return _collection.insert(objects.map(\ o -> new BasicDBObject(o)), WriteConcern.ACKNOWLEDGED)
  }

  property get Count() : long {
    return _collection.getCount()
  }

  function getCount(o : Map<String, Object>) : long {
    return _collection.getCount(new BasicDBObject(o))
  }

  function remove(o : Map<String, Object>) : WriteResult {
    return _collection.remove(new BasicDBObject(o))
  }

  function save(o : Map<String, Object>) : WriteResult {
    return _collection.save(new BasicDBObject(o),WriteConcern.ACKNOWLEDGED)
  }

  function update(q : DBObject, o : DBObject) {
    _collection.update(q, o,false,false,WriteConcern.ACKNOWLEDGED)
  }

  function drop() {
    _collection.drop()
  }

}