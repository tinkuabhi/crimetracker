
output "aks_name" {
  value = azurerm_kubernetes_cluster.this.name
}

output "aks_node_count" {
  value = azurerm_kubernetes_cluster.this.default_node_pool[0].node_count
}

