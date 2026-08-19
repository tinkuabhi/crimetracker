variable "vnet_name" {}
variable "location" {}
variable "resource_group_name" {}
variable "address_space" {
  type = list(string)
}
variable "subnet_name" {}
variable "subnet_prefixes" {
  type = list(string)
}
