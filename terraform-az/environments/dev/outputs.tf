output "rg_name" {
  value = module.rg.rg_name
}

output "rg_location" {
  value = module.rg.rg_location
}

output "rg_id" {
  value = module.rg.rg_name
}

output "rg_vnet" {
  value = module.network.vnet_name
}

output "aks_name" {
  value = module.aks.aks_name
}

output "aks_node_count" {
  value = module.aks.aks_node_count
}

output "acr_login_server" {
  value = module.acr.acr_login_server
}

output "acr_id" {
  value = module.acr.acr_id
}
