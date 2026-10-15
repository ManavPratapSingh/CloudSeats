variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "ap-south-1"
}

variable "cluster_name" {
  description = "EKS Cluster Name"
  type        = string
  default     = "cloudseats-eks"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}
