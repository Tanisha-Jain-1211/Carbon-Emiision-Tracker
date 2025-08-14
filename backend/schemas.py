from pydantic import BaseModel

class RegisterUser(BaseModel):
    name: str
    username: str
    password: str
    mobile: str

class LoginUser(BaseModel):
    username: str
    password: str
