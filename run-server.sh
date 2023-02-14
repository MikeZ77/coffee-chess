#!/bin/bash
if [ "$ENV" = "dev" ]; then
    npm run dev
elif [ "$ENV" = "lab" ]; then
    npm run lab
fi