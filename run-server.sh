#!/bin/bash
if [ "$ENV" = "dev" ]; then
    npm run dev
elif [ "$ENV" = "lab" ]; then
    rm .env && npm run lab
fi