package model

uses java.util.Map
uses java.math.BigDecimal


class Company extends DataSetEntry {

  construct(dataSetName : String) {
    super(dataSetName)
  }

  property set CompanyName(companyName : String) {
    put("companyName", companyName)
  }
  property get CompanyName() : String {
    return get("companyName") as String
  }

  property set ContactName(contactName : String) {
    put("contactName", contactName)
  }
  property get ContactName() : String {
    return get("contactName") as String
  }

  property set Email(email : String) {
    put("email", email)
  }
  property get Email() : String {
    return get("email") as String
  }

  property set Region(region : String) {
    put("region", region)
  }
  property get Region() : String {
    return get("region") as String
  }

  property set Policies(policies : Map<String, BigDecimal>) {
    put("policies", policies)
  }
  property get Policies() : Map<String, BigDecimal> {
    return get("policies") as Map<String, BigDecimal>
  }

}