from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, time


# Schemas for Company
class CompanyBase(BaseModel):
    company_name: str


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(CompanyBase):
    pass


class CompanyResponse(CompanyBase):
    id: int

    class Config:
        from_attributes = True


# Schemas for Shop
class ShopBase(BaseModel):
    company_id: int
    address: str


class ShopCreate(ShopBase):
    pass


class ShopUpdate(ShopBase):
    pass


class ShopResponse(ShopBase):
    id: int
    company: Optional[CompanyResponse] = None

    class Config:
        from_attributes = True


# Schemas for Category
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: int

    class Config:
        from_attributes = True


# Schemas for Manufacturer
class ManufacturerBase(BaseModel):
    name: str
    contact_person: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None
    location: Optional[str] = None


class ManufacturerCreate(ManufacturerBase):
    pass


class ManufacturerUpdate(ManufacturerBase):
    pass


class ManufacturerResponse(ManufacturerBase):
    id: int

    class Config:
        from_attributes = True


# Schemas for Image
class ImageBase(BaseModel):
    link: str


class ImageCreate(ImageBase):
    pass


class ImageResponse(ImageBase):
    id: int
    image_group_id: int

    class Config:
        from_attributes = True


# Schemas for ProductImageGroup
class ProductImageGroupBase(BaseModel):
    product_id: int


class ProductImageGroupCreate(ProductImageGroupBase):
    pass


class ProductImageGroupResponse(ProductImageGroupBase):
    id: int
    images: List[ImageResponse] = []

    class Config:
        from_attributes = True


# Schemas for Product
class ProductBase(BaseModel):
    shop_id: int
    category_id: Optional[int] = None
    manufacturer_id: Optional[int] = None
    name: str
    price: float
    weight: Optional[float] = None
    calories: Optional[float] = None
    structure: Optional[str] = None
    stock_amount: int = 0


class ProductCreate(ProductBase):
    pass


class ProductUpdate(ProductBase):
    pass


class ProductResponse(ProductBase):
    id: int
    shop: Optional[ShopResponse] = None
    category: Optional[CategoryResponse] = None
    manufacturer: Optional[ManufacturerResponse] = None
    image_group: Optional[ProductImageGroupResponse] = None

    class Config:
        from_attributes = True


# Schemas for Customer
class CustomerBase(BaseModel):
    name: str
    phone_number: Optional[str] = None


class CustomerCreate(CustomerBase):
    pass


class CustomerResponse(CustomerBase):
    id: int

    class Config:
        from_attributes = True


# Schemas for Payment
class PaymentBase(BaseModel):
    bank_name: str
    payment_link: Optional[str] = None


class PaymentCreate(PaymentBase):
    pass


class PaymentResponse(PaymentBase):
    id: int

    class Config:
        from_attributes = True


# Schemas for Post
class PostBase(BaseModel):
    name: str
    salary: float


class PostCreate(PostBase):
    pass


class PostUpdate(PostBase):
    pass


class PostResponse(PostBase):
    id: int

    class Config:
        from_attributes = True


# Schemas for Worker
class WorkerBase(BaseModel):
    post_id: Optional[int] = None
    full_name: str
    email: Optional[str] = None
    phone_number: Optional[str] = None


class WorkerCreate(WorkerBase):
    pass


class WorkerUpdate(WorkerBase):
    pass


class WorkerResponse(WorkerBase):
    id: int
    post: Optional[PostResponse] = None

    class Config:
        from_attributes = True


# Schemas for OrderItem
class OrderItemBase(BaseModel):
    order_id: int
    product_id: int
    quantity: int
    unit_price: float


class OrderItemCreate(OrderItemBase):
    pass


class OrderItemResponse(OrderItemBase):
    id: int
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True


# Schemas for Check
class CheckBase(BaseModel):
    order_id: int
    total_price: float


class CheckCreate(CheckBase):
    pass


class CheckResponse(CheckBase):
    id: int
    created_date: datetime
    created_time: time

    class Config:
        from_attributes = True


# Schemas for Order
class OrderBase(BaseModel):
    courier_id: Optional[int] = None
    customer_id: int
    payment_id: Optional[int] = None
    delivery_address: Optional[str] = None
    status: str = "new"


class OrderCreate(OrderBase):
    pass


class OrderUpdate(OrderBase):
    pass


class OrderResponse(OrderBase):
    id: int
    created_at: datetime
    customer: Optional[CustomerResponse] = None
    payment: Optional[PaymentResponse] = None
    courier: Optional[WorkerResponse] = None
    items: List[OrderItemResponse] = []
    check: Optional[CheckResponse] = None

    class Config:
        from_attributes = True


# Schema for Cart Item (frontend use)
class CartItem(BaseModel):
    product_id: int
    quantity: int
    name: str
    price: float


# Schema for placing an order
class PlaceOrderRequest(BaseModel):
    customer_name: str
    customer_phone: Optional[str] = None
    delivery_address: str
    payment_bank: str
    items: List[CartItem]


# Schema for login
class LoginRequest(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
