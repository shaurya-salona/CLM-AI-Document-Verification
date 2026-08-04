import pytest

def test_user_registration_and_login(client):
    # Test registration
    reg_response = client.post("/auth/register", json={
        "name": "Test Vendor User",
        "email": "testvendor@clm.com",
        "password": "password123",
        "role": "vendor",
        "location": "Jamshedpur"
    })
    assert reg_response.status_code == 200
    reg_data = reg_response.json()
    assert reg_data["email"] == "testvendor@clm.com"
    assert reg_data["role"] == "vendor"

    # Test login endpoint (JSON payload)
    login_response = client.post("/login", json={
        "email": "testvendor@clm.com",
        "password": "password123"
    })
    assert login_response.status_code == 200
    token_data = login_response.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
    assert token_data["user"]["email"] == "testvendor@clm.com"
