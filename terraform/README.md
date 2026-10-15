# CloudSeats — Terraform AWS EKS Infrastructure

Infrastructure as Code to provision an Amazon EKS cluster and VPC in AWS `ap-south-1` (Mumbai).

## Architecture

- **VPC (`10.20.0.0/16`)**:
  - 2 Availability Zones (`ap-south-1a`, `ap-south-1b`)
  - 2 Public Subnets (`10.20.101.0/24`, `10.20.102.0/24`) with `kubernetes.io/role/elb=1`
  - 2 Private Subnets (`10.20.1.0/24`, `10.20.2.0/24`) with `kubernetes.io/role/internal-elb=1`
  - Single NAT Gateway for cost-efficiency
- **EKS Cluster (v1.31)**:
  - Managed Node Group: 2x `t3.medium` instances (min: 2, max: 4, desired: 2)
  - Public Endpoint Access enabled for kubectl administration

## Prerequisites

1. AWS CLI configured with administrator credentials:
   ```bash
   aws configure
   ```
2. Terraform >= 1.5.0 installed.

## Deployment Steps

1. Copy the variables example file:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

2. Initialize Terraform providers and modules:
   ```bash
   terraform init
   ```

3. Validate configuration:
   ```bash
   terraform fmt -check
   terraform validate
   ```

4. Preview infrastructure plan:
   ```bash
   terraform plan -out=tfplan
   ```

5. Provision infrastructure (takes ~12-15 minutes for EKS):
   ```bash
   terraform apply tfplan
   ```

6. Connect kubectl to the new EKS cluster:
   ```bash
   aws eks update-kubeconfig --region ap-south-1 --name cloudseats-eks
   kubectl get nodes
   ```

## Teardown Instructions

> [!WARNING]
> Before destroying Terraform infrastructure, you must delete any Kubernetes LoadBalancers / Ingress services so AWS doesn't leave dangling ENIs:
> ```bash
> helm uninstall cloudseats -n cloudseats
> kubectl delete svc -n cloudseats --all
> kubectl delete ingress -n cloudseats --all
> ```
> Then destroy:
> ```bash
> terraform destroy -auto-approve
> ```
