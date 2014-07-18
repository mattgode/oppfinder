package model

uses com.mongodb.BasicDBObject
uses java.util.Map
uses java.util.Set
uses com.mongodb.DBObject
uses util.inflector.Inflector
uses java.lang.Class
uses util.iterable.SkipIterable
uses util.iterable.TransformIterable

abstract class Document {

  var _obj : DBObject
  var _id : Object //Unique ID. This would be the primary key in a SQL database or a unique document ID in MongoDB
  var _collection : MongoCollection
  var inserted : boolean as readonly Persisted

  //If no name is supplied, the name of the data source is assumed to be the plural of the name of the class
  construct() {
    _obj = new BasicDBObject()
    _collection = new MongoCollection(Inflector.pluralize(this.IntrinsicType.GenericType.Name).toLowerCase())
    inserted = false
  }

  construct(collection : String) {
    _obj = new BasicDBObject()
    _collection = new MongoCollection(collection)
    inserted = false
  }

  //If no name is supplied, the name of the data source is assumed to be the plural of the name of the class
  construct(key : String, value : String) {
    _collection = new MongoCollection(Inflector.pluralize(this.IntrinsicType.GenericType.Name).toLowerCase())
    reload(key, value)
    _id = _obj['_id']
    inserted = true
  }

  construct(collection : String, key : String, value : String) {
    _collection = new MongoCollection(collection)
    reload(key, value)
    _id = _obj['_id']
    inserted = true
  }

  function upsert(key : String, value : Object) {
    _obj.put(key, value)
  }

  function upsertAndSave(key : String, value : Object) {
    _obj.put(key, value)
    save()
  }

  function upsertAll(upserts : Map<String, Object>) {
    _obj.putAll(upserts)
  }

  function upsertAllAndSave(upserts : Map<String, Object>) {
    _obj.putAll(upserts)
    save()
  }

  function delete() {
    _collection.remove('_id',_id)
  }

  function increment(field : String, by = 1) {
    _collection.increment(query(), new BasicDBObject(field, by))
  }

  function decrement(field : String, by = 1) {
    increment(field, by*-1)
  }

  function save() {
    if (inserted) {
      _collection.update(query(), _obj)
    } else {
      _obj['intrinsic_type'] = this.IntrinsicType.Name
      _id = _collection.insert(_obj).UpsertedId
    }
  }

  function reload(key = '_id', value = null) {
    _obj = _collection.findOne(new BasicDBObject(key, value ?: _id))
  }

  function getField(value : String) : Object {
    return _obj[value]
  }

  static function find(key : String, value : Object, collection : String) : Document {
    var _collection = new MongoCollection(collection)
    return instantiate(_collection.findOne(new BasicDBObject(key, value)))
  }

  static function find(criteria : Map<String, Object>, collection : String) : Document {
    var _collection = new MongoCollection(collection)
    return instantiate(_collection.findOne(new BasicDBObject(criteria)))
  }

  static function findMany(key : String, value : Object, collection : String) : SkipIterable<Document> {
    var _collection = new MongoCollection(collection)
    return instantiateMany(_collection.find(new BasicDBObject(key, value)))
  }

  static function findMany(criteria : Map<String, Object>, collection : String) : SkipIterable<Document> {
    var _collection = new MongoCollection(collection)
    return instantiateMany(_collection.find(new BasicDBObject(criteria)))
  }

  protected static function instantiateMany(documents : TransformIterable<DBObject>) : SkipIterable<Document> {
    return new TransformIterable<Document>(documents.Cursor,\ d -> instantiate(d as DBObject))
  }

  protected static function instantiate(d : DBObject) : Document {
    return Class.forName(d['intrinsic_type'] as String)
    .getConstructor({String.Type, Object.Type})
        .newInstance({'_id', d['_id']}) as Document
  }

  property get AllFields() : Set<String> {
    var keys = _obj.keySet()
    keys.remove('_id')
    keys.remove('intrinsic_type')
    return keys
  }

  private function query() : DBObject {
    return new BasicDBObject('_id', _obj['_id'])
  }

}