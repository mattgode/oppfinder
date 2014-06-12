package recommender

uses org.apache.mahout.cf.taste.model.DataModel
uses org.apache.mahout.cf.taste.similarity.UserSimilarity
uses util.MahoutUtil
uses model.DataSet
uses java.lang.Long
uses org.apache.mahout.cf.taste.impl.similarity.PearsonCorrelationSimilarity

class SizeFieldImpl implements Field {
  override function getModel(): DataModel {
    return MahoutUtil.toDataModel(new DataSet("oppFinder"), "Size", \ o -> o.toLong())

  }

  override function getSimilarity(model : DataModel): UserSimilarity {
    return new PearsonCorrelationSimilarity(model)
  }
}