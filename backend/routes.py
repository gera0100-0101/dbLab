from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import shutil
import os
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

from database import get_db
from models import (
    Company, Shop, Category, Manufacturer, Product, ProductImageGroup, Image,
    Customer, Payment, Post, Worker, Order, OrderItem, Check
)
from schemas import (
    CompanyCreate, CompanyResponse, CompanyUpdate,
    ShopCreate, ShopResponse, ShopUpdate,
    CategoryCreate, CategoryResponse, CategoryUpdate,
    ManufacturerCreate, ManufacturerResponse, ManufacturerUpdate,
    ProductCreate, ProductResponse, ProductUpdate,
    WorkerCreate, WorkerResponse, WorkerUpdate,
    PostCreate, PostResponse, PostUpdate,
    OrderResponse, OrderUpdate, PlaceOrderRequest,
    LoginRequest, Token
)
from config import settings

router = APIRouter()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Admin credentials (in production, store in DB)
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD_HASH = pwd_context.hash("12345")


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


@router.post("/login", response_model=Token)
def login(login_data: LoginRequest):
    if login_data.username != ADMIN_USERNAME or not verify_password(login_data.password, ADMIN_PASSWORD_HASH):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": login_data.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


# Dependency to check admin auth
async def get_current_user(token: str = Depends(lambda: None)):
    # Simple token validation - in production use proper header parsing
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None or username != ADMIN_USERNAME:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return username
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


# Companies endpoints
@router.get("/companies", response_model=List[CompanyResponse])
def get_companies(db: Session = Depends(get_db)):
    return db.query(Company).all()


@router.post("/companies", response_model=CompanyResponse)
def create_company(company: CompanyCreate, db: Session = Depends(get_db)):
    db_company = Company(**company.model_dump())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company


@router.put("/companies/{company_id}", response_model=CompanyResponse)
def update_company(company_id: int, company: CompanyUpdate, db: Session = Depends(get_db)):
    db_company = db.query(Company).filter(Company.id == company_id).first()
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")
    for key, value in company.model_dump().items():
        setattr(db_company, key, value)
    db.commit()
    db.refresh(db_company)
    return db_company


@router.delete("/companies/{company_id}")
def delete_company(company_id: int, db: Session = Depends(get_db)):
    db_company = db.query(Company).filter(Company.id == company_id).first()
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")
    db.delete(db_company)
    db.commit()
    return {"message": "Company deleted"}


# Shops endpoints
@router.get("/shops", response_model=List[ShopResponse])
def get_shops(db: Session = Depends(get_db)):
    return db.query(Shop).all()


@router.post("/shops", response_model=ShopResponse)
def create_shop(shop: ShopCreate, db: Session = Depends(get_db)):
    db_shop = Shop(**shop.model_dump())
    db.add(db_shop)
    db.commit()
    db.refresh(db_shop)
    return db_shop


@router.put("/shops/{shop_id}", response_model=ShopResponse)
def update_shop(shop_id: int, shop: ShopUpdate, db: Session = Depends(get_db)):
    db_shop = db.query(Shop).filter(Shop.id == shop_id).first()
    if not db_shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    for key, value in shop.model_dump().items():
        setattr(db_shop, key, value)
    db.commit()
    db.refresh(db_shop)
    return db_shop


@router.delete("/shops/{shop_id}")
def delete_shop(shop_id: int, db: Session = Depends(get_db)):
    db_shop = db.query(Shop).filter(Shop.id == shop_id).first()
    if not db_shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    db.delete(db_shop)
    db.commit()
    return {"message": "Shop deleted"}


# Categories endpoints
@router.get("/categories", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()


@router.post("/categories", response_model=CategoryResponse)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    db_category = Category(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


@router.put("/categories/{category_id}", response_model=CategoryResponse)
def update_category(category_id: int, category: CategoryUpdate, db: Session = Depends(get_db)):
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    for key, value in category.model_dump().items():
        setattr(db_category, key, value)
    db.commit()
    db.refresh(db_category)
    return db_category


@router.delete("/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(db_category)
    db.commit()
    return {"message": "Category deleted"}


# Manufacturers endpoints
@router.get("/manufacturers", response_model=List[ManufacturerResponse])
def get_manufacturers(db: Session = Depends(get_db)):
    return db.query(Manufacturer).all()


@router.post("/manufacturers", response_model=ManufacturerResponse)
def create_manufacturer(manufacturer: ManufacturerCreate, db: Session = Depends(get_db)):
    db_manufacturer = Manufacturer(**manufacturer.model_dump())
    db.add(db_manufacturer)
    db.commit()
    db.refresh(db_manufacturer)
    return db_manufacturer


@router.put("/manufacturers/{manufacturer_id}", response_model=ManufacturerResponse)
def update_manufacturer(manufacturer_id: int, manufacturer: ManufacturerUpdate, db: Session = Depends(get_db)):
    db_manufacturer = db.query(Manufacturer).filter(Manufacturer.id == manufacturer_id).first()
    if not db_manufacturer:
        raise HTTPException(status_code=404, detail="Manufacturer not found")
    for key, value in manufacturer.model_dump().items():
        setattr(db_manufacturer, key, value)
    db.commit()
    db.refresh(db_manufacturer)
    return db_manufacturer


@router.delete("/manufacturers/{manufacturer_id}")
def delete_manufacturer(manufacturer_id: int, db: Session = Depends(get_db)):
    db_manufacturer = db.query(Manufacturer).filter(Manufacturer.id == manufacturer_id).first()
    if not db_manufacturer:
        raise HTTPException(status_code=404, detail="Manufacturer not found")
    db.delete(db_manufacturer)
    db.commit()
    return {"message": "Manufacturer deleted"}


# Products endpoints
@router.get("/products", response_model=List[ProductResponse])
def get_products(shop_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Product)
    if shop_id:
        query = query.filter(Product.shop_id == shop_id)
    return query.all()


@router.get("/products/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/products", response_model=ProductResponse)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    db_product = Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    # Create image group for the product
    image_group = ProductImageGroup(product_id=db_product.id)
    db.add(image_group)
    db.commit()
    
    db.refresh(db_product)
    return db_product


@router.put("/products/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, product: ProductUpdate, db: Session = Depends(get_db)):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    for key, value in product.model_dump().items():
        setattr(db_product, key, value)
    db.commit()
    db.refresh(db_product)
    return db_product


@router.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(db_product)
    db.commit()
    return {"message": "Product deleted"}


# Image upload endpoint
@router.post("/products/{product_id}/upload-image")
def upload_product_image(product_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Get or create image group
    image_group = db.query(ProductImageGroup).filter(ProductImageGroup.product_id == product_id).first()
    if not image_group:
        image_group = ProductImageGroup(product_id=product_id)
        db.add(image_group)
        db.commit()
        db.refresh(image_group)
    
    # Save uploaded file
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(settings.UPLOAD_DIR, f"{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Create image record
    image_link = f"/uploads/{file.filename}"
    image = Image(image_group_id=image_group.id, link=image_link)
    db.add(image)
    db.commit()
    db.refresh(image)
    
    return {"message": "Image uploaded", "link": image_link}


@router.put("/products/{product_id}/update-image")
def update_product_image(product_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Get image group
    image_group = db.query(ProductImageGroup).filter(ProductImageGroup.product_id == product_id).first()
    if not image_group:
        image_group = ProductImageGroup(product_id=product_id)
        db.add(image_group)
        db.commit()
        db.refresh(image_group)
    
    # Delete old images
    old_images = db.query(Image).filter(Image.image_group_id == image_group.id).all()
    for old_img in old_images:
        try:
            os.remove(os.path.join(settings.UPLOAD_DIR, old_img.link.split("/")[-1]))
        except:
            pass
        db.delete(old_img)
    db.commit()
    
    # Save new file
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(settings.UPLOAD_DIR, f"{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Create new image record
    image_link = f"/uploads/{file.filename}"
    image = Image(image_group_id=image_group.id, link=image_link)
    db.add(image)
    db.commit()
    db.refresh(image)
    
    return {"message": "Image updated", "link": image_link}


# Posts endpoints
@router.get("/posts", response_model=List[PostResponse])
def get_posts(db: Session = Depends(get_db)):
    return db.query(Post).all()


@router.post("/posts", response_model=PostResponse)
def create_post(post: PostCreate, db: Session = Depends(get_db)):
    db_post = Post(**post.model_dump())
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post


@router.put("/posts/{post_id}", response_model=PostResponse)
def update_post(post_id: int, post: PostUpdate, db: Session = Depends(get_db)):
    db_post = db.query(Post).filter(Post.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    for key, value in post.model_dump().items():
        setattr(db_post, key, value)
    db.commit()
    db.refresh(db_post)
    return db_post


@router.delete("/posts/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db)):
    db_post = db.query(Post).filter(Post.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(db_post)
    db.commit()
    return {"message": "Post deleted"}


# Workers endpoints
@router.get("/workers", response_model=List[WorkerResponse])
def get_workers(db: Session = Depends(get_db)):
    return db.query(Worker).all()


@router.post("/workers", response_model=WorkerResponse)
def create_worker(worker: WorkerCreate, db: Session = Depends(get_db)):
    db_worker = Worker(**worker.model_dump())
    db.add(db_worker)
    db.commit()
    db.refresh(db_worker)
    return db_worker


@router.put("/workers/{worker_id}", response_model=WorkerResponse)
def update_worker(worker_id: int, worker: WorkerUpdate, db: Session = Depends(get_db)):
    db_worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not db_worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    for key, value in worker.model_dump().items():
        setattr(db_worker, key, value)
    db.commit()
    db.refresh(db_worker)
    return db_worker


@router.delete("/workers/{worker_id}")
def delete_worker(worker_id: int, db: Session = Depends(get_db)):
    db_worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not db_worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    db.delete(db_worker)
    db.commit()
    return {"message": "Worker deleted"}


# Orders endpoints
@router.get("/orders", response_model=List[OrderResponse])
def get_orders(db: Session = Depends(get_db)):
    return db.query(Order).all()


@router.get("/orders/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("/orders", response_model=OrderResponse)
def place_order(order_data: PlaceOrderRequest, db: Session = Depends(get_db)):
    # Create customer
    customer = Customer(name=order_data.customer_name, phone_number=order_data.customer_phone)
    db.add(customer)
    db.commit()
    db.refresh(customer)
    
    # Create payment
    payment = Payment(bank_name=order_data.payment_bank)
    db.add(payment)
    db.commit()
    db.refresh(payment)
    
    # Create order
    order = Order(
        customer_id=customer.id,
        payment_id=payment.id,
        delivery_address=order_data.delivery_address
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    
    # Create order items
    total_price = 0
    for item in order_data.items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.price
        )
        db.add(order_item)
        total_price += item.price * item.quantity
        
        # Update stock
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            product.stock_amount -= item.quantity
    
    # Create check
    check = Check(order_id=order.id, total_price=total_price)
    db.add(check)
    
    db.commit()
    db.refresh(order)
    
    return order


@router.put("/orders/{order_id}", response_model=OrderResponse)
def update_order(order_id: int, order: OrderUpdate, db: Session = Depends(get_db)):
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    for key, value in order.model_dump().items():
        setattr(db_order, key, value)
    db.commit()
    db.refresh(db_order)
    return db_order


@router.delete("/orders/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    db.delete(db_order)
    db.commit()
    return {"message": "Order deleted"}
