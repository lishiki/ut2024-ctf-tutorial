#!/bin/bash

generate_random_string() {
    local length=$1
    head -c $length </dev/urandom | base64 | tr -dc A-Za-z0-9 | head -c $length
}

{
    echo "FLAG_SQLI1='CTF{sqli1_$(generate_random_string 8)}'"
    echo "FLAG_SQLI2='CTF{sqli2_$(generate_random_string 8)}'"
    echo "FLAG_SQLI3='CTF{sqli3_$(generate_random_string 8)}'"
    echo "FLAG_XSS1='CTF{xss1_$(generate_random_string 8)}'"
    echo "FLAG_XSS2='CTF{xss2_$(generate_random_string 8)}'"
    echo "FLAG_XSS3='CTF{xss3_$(generate_random_string 8)}'"
} > .env