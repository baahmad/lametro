export const API_BASE_URL = import.meta.env.PROD
    ? 'http://lametro-alb-1393080733.us-east-2.elb.amazonaws.com'
    : 'http://localhost:8080';