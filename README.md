# diabetics_pred

docker run -d --name diabetes-backend \                                                                                                                                                                                        │
     --link diabetes-postgres:postgres \                                                                                                                                                                                          │
     -e DATABASE_URL=postgresql://diabetesapp:diabetesapp123@postgres:5432/diabetes_db \                                                                                                                                          │
     -e JWT_SECRET_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6 \                                                                                                                                                     │
     -e JWT_ACCESS_TOKEN_EXPIRES=3600 \                                                                                                                                                                                           │
     -e FLASK_ENV=production \                                                                                                                                                                                                    │
     -e DEBUG=False \                                                                                                                                                                                                             │
     -e PORT=5000 \                                                                                                                                                                                                               │
     -e CORS_ORIGINS='http://localhost:3000,http://localhost:3001,http://localhost:3002' \                                                                                                                                        │
     -e GROQ_API_KEY='your-groq-api-key-here' \                                                                                                                                                   │
     -e LOG_LEVEL=INFO \                                                                                                                                                                                                          │
     -p 5001:5000 \                                                                                                                                                                                                               │
     -v "$(pwd)/logs:/app/logs" \                                                                                                                                                                                                 │
     -v "$(pwd)/uploads:/app/uploads" \                                                                                                                                                                                           │
     diabetes-backend


docker run -d --name diabetes-backend \                                                                                                                                                                                        │
     --link diabetes-postgres:postgres \                                                                                                                                                                                          │
     -e DATABASE_URL=postgresql://diabetesapp:diabetesapp123@postgres:5432/diabetes_db \                                                                                                                                          │
     -e JWT_SECRET_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6 \                                                                                                                                                     │
     -e JWT_ACCESS_TOKEN_EXPIRES=3600 \                                                                                                                                                                                           │
     -e FLASK_ENV=production \                                                                                                                                                                                                    │
     -e DEBUG=False \                                                                                                                                                                                                             │
     -e PORT=5000 \                                                                                                                                                                                                               │
     -e CORS_ORIGINS='http://localhost:3000,http://localhost:3001,http://localhost:3002' \                                                                                                                                        │
     -e GROQ_API_KEY='your-groq-api-key-here' \                                                                                                                                                   │
     -e LOG_LEVEL=INFO \                                                                                                                                                                                                          │
     -p 5001:5000 \                                                                                                                                                                                                               │
     -v "$(pwd)/logs:/app/logs" \                                                                                                                                                                                                 │
     -v "$(pwd)/uploads:/app/uploads" \                                                                                                                                                                                           │
     diabetes-backend 