variable "resource_group_name" {
  type        = string
}

variable "location" {
  type        = string
 }

variable "vnet_name" {}
variable "address_space" {
  type = list(string)
}
variable "subnet_name" {}
variable "subnet_prefixes" {
  type = list(string)
}
