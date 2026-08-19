module "rg" {
  source              = "../../modules/rm"
  resource_group_name = var.resource_group_name
  location            = var.location
}

module "network" {
  source              = "../../modules/network"
  vnet_name           = var.vnet_name
  location            = module.rg.rg_location
  resource_group_name = module.rg.rg_name
  address_space       = var.address_space
  subnet_name         = var.subnet_name
  subnet_prefixes     = var.subnet_prefixes
}

module "aks" {
  source              = "../../modules/aks"
  cluster_name        = "dev-aks"
  location            = module.rg.rg_location
  resource_group_name = module.rg.rg_name
  dns_prefix          = "devaks"
}

module "acr" {
  source              = "../../modules/acr"
  acr_name            = "crimetracker101"   # must be globally unique
  resource_group_name = module.rg.rg_name
  location            = module.rg.rg_location
}

