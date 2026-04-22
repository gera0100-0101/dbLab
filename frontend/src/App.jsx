import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authAPI, productsAPI, categoriesAPI, manufacturersAPI, shopsAPI, workersAPI, postsAPI, ordersAPI, companiesAPI } from './api';
import './App.css';

// Login Component
function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await authAPI.login(username, password);
      localStorage.setItem('token', response.data.access_token);
      onLogin();
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="login-container">
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="error">{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

// Products List Component
function ProductsList({ addToCart }) {
  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState('');

  useEffect(() => {
    loadProducts();
    loadShops();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };

  const loadShops = async () => {
    try {
      const response = await shopsAPI.getAll();
      setShops(response.data);
    } catch (err) {
      console.error('Error loading shops:', err);
    }
  };

  const filteredProducts = selectedShop 
    ? products.filter(p => p.shop_id === parseInt(selectedShop))
    : products;

  return (
    <div className="container">
      <h2>Products</h2>
      <select value={selectedShop} onChange={(e) => setSelectedShop(e.target.value)}>
        <option value="">All Shops</option>
        {shops.map(shop => (
          <option key={shop.id} value={shop.id}>{shop.address}</option>
        ))}
      </select>
      <div className="grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="card product-card">
            {product.image_group?.images?.[0]?.link && (
              <img src={`http://localhost:8000${product.image_group.images[0].link}`} alt={product.name} />
            )}
            <h3>{product.name}</h3>
            <p>Price: ${product.price}</p>
            {product.weight && <p>Weight: {product.weight}g</p>}
            {product.calories && <p>Calories: {product.calories}</p>}
            {product.structure && <p className="structure">Ingredients: {product.structure}</p>}
            <p>Stock: {product.stock_amount}</p>
            {product.category && <p>Category: {product.category.name}</p>}
            {product.manufacturer && <p>Manufacturer: {product.manufacturer.name}</p>}
            <button onClick={() => addToCart(product)}>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Cart Component
function Cart({ cart, updateQuantity, placeOrder }) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentBank, setPaymentBank] = useState('');

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePlaceOrder = () => {
    if (!customerName || !deliveryAddress || !paymentBank) {
      alert('Please fill in all required fields');
      return;
    }
    placeOrder({ customerName, customerPhone, deliveryAddress, paymentBank });
  };

  return (
    <div className="container">
      <h2>Shopping Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.product_id} className="cart-item card">
                <h4>{item.name}</h4>
                <p>Price: ${item.price}</p>
                <div className="quantity-controls">
                  <button onClick={() => updateQuantity(item.product_id, -1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product_id, 1)}>+</button>
                </div>
                <p>Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="card checkout-form">
            <h3>Checkout</h3>
            <input
              type="text"
              placeholder="Your Name *"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
            <textarea
              placeholder="Delivery Address *"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
            />
            <input
              type="text"
              placeholder="Bank Name for Payment *"
              value={paymentBank}
              onChange={(e) => setPaymentBank(e.target.value)}
            />
            <h3>Total: ${total.toFixed(2)}</h3>
            <button onClick={handlePlaceOrder} className="checkout-btn">Place Order</button>
          </div>
        </>
      )}
    </div>
  );
}

// Admin Panel Component
function AdminPanel() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [shops, setShops] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [companies, setCompanies] = useState([]);
  
  // Form states
  const [productForm, setProductForm] = useState({ name: '', price: '', weight: '', calories: '', structure: '', stock_amount: 0, shop_id: '', category_id: '', manufacturer_id: '' });
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [manufacturerForm, setManufacturerForm] = useState({ name: '', contact_person: '', phone_number: '', email: '', location: '' });
  const [shopForm, setShopForm] = useState({ company_id: '', address: '' });
  const [workerForm, setWorkerForm] = useState({ full_name: '', email: '', phone_number: '', post_id: '' });
  const [postForm, setPostForm] = useState({ name: '', salary: '' });
  const [orderForm, setOrderForm] = useState({ courier_id: '', customer_id: '', delivery_address: '', status: 'new' });
  const [companyForm, setCompanyForm] = useState({ company_name: '' });
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [productsRes, categoriesRes, manufacturersRes, shopsRes, workersRes, postsRes, ordersRes, companiesRes] = await Promise.all([
        productsAPI.getAll(),
        categoriesAPI.getAll(),
        manufacturersAPI.getAll(),
        shopsAPI.getAll(),
        workersAPI.getAll(),
        postsAPI.getAll(),
        ordersAPI.getAll(),
        companiesAPI.getAll()
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
      setManufacturers(manufacturersRes.data);
      setShops(shopsRes.data);
      setWorkers(workersRes.data);
      setPosts(postsRes.data);
      setOrders(ordersRes.data);
      setCompanies(companiesRes.data);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  // Product handlers
  const handleCreateProduct = async () => {
    try {
      await productsAPI.create(productForm);
      loadAllData();
      setProductForm({ name: '', price: '', weight: '', calories: '', structure: '', stock_amount: 0, shop_id: '', category_id: '', manufacturer_id: '' });
    } catch (err) {
      console.error('Error creating product:', err);
    }
  };

  const handleUpdateProduct = async () => {
    try {
      await productsAPI.update(editingId, productForm);
      loadAllData();
      setEditingId(null);
      setProductForm({ name: '', price: '', weight: '', calories: '', structure: '', stock_amount: 0, shop_id: '', category_id: '', manufacturer_id: '' });
    } catch (err) {
      console.error('Error updating product:', err);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await productsAPI.delete(id);
      loadAllData();
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const handleUploadImage = async (productId) => {
    if (!imageFile) return;
    try {
      if (editingId) {
        await productsAPI.updateImage(productId, imageFile);
      } else {
        await productsAPI.uploadImage(productId, imageFile);
      }
      loadAllData();
      setImageFile(null);
    } catch (err) {
      console.error('Error uploading image:', err);
    }
  };

  // Category handlers
  const handleCreateCategory = async () => {
    try {
      await categoriesAPI.create(categoryForm);
      loadAllData();
      setCategoryForm({ name: '', description: '' });
    } catch (err) {
      console.error('Error creating category:', err);
    }
  };

  const handleUpdateCategory = async () => {
    try {
      await categoriesAPI.update(editingId, categoryForm);
      loadAllData();
      setEditingId(null);
      setCategoryForm({ name: '', description: '' });
    } catch (err) {
      console.error('Error updating category:', err);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await categoriesAPI.delete(id);
      loadAllData();
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  // Manufacturer handlers
  const handleCreateManufacturer = async () => {
    try {
      await manufacturersAPI.create(manufacturerForm);
      loadAllData();
      setManufacturerForm({ name: '', contact_person: '', phone_number: '', email: '', location: '' });
    } catch (err) {
      console.error('Error creating manufacturer:', err);
    }
  };

  const handleUpdateManufacturer = async () => {
    try {
      await manufacturersAPI.update(editingId, manufacturerForm);
      loadAllData();
      setEditingId(null);
      setManufacturerForm({ name: '', contact_person: '', phone_number: '', email: '', location: '' });
    } catch (err) {
      console.error('Error updating manufacturer:', err);
    }
  };

  const handleDeleteManufacturer = async (id) => {
    try {
      await manufacturersAPI.delete(id);
      loadAllData();
    } catch (err) {
      console.error('Error deleting manufacturer:', err);
    }
  };

  // Shop handlers
  const handleCreateShop = async () => {
    try {
      await shopsAPI.create(shopForm);
      loadAllData();
      setShopForm({ company_id: '', address: '' });
    } catch (err) {
      console.error('Error creating shop:', err);
    }
  };

  const handleUpdateShop = async () => {
    try {
      await shopsAPI.update(editingId, shopForm);
      loadAllData();
      setEditingId(null);
      setShopForm({ company_id: '', address: '' });
    } catch (err) {
      console.error('Error updating shop:', err);
    }
  };

  const handleDeleteShop = async (id) => {
    try {
      await shopsAPI.delete(id);
      loadAllData();
    } catch (err) {
      console.error('Error deleting shop:', err);
    }
  };

  // Worker handlers
  const handleCreateWorker = async () => {
    try {
      await workersAPI.create(workerForm);
      loadAllData();
      setWorkerForm({ full_name: '', email: '', phone_number: '', post_id: '' });
    } catch (err) {
      console.error('Error creating worker:', err);
    }
  };

  const handleUpdateWorker = async () => {
    try {
      await workersAPI.update(editingId, workerForm);
      loadAllData();
      setEditingId(null);
      setWorkerForm({ full_name: '', email: '', phone_number: '', post_id: '' });
    } catch (err) {
      console.error('Error updating worker:', err);
    }
  };

  const handleDeleteWorker = async (id) => {
    try {
      await workersAPI.delete(id);
      loadAllData();
    } catch (err) {
      console.error('Error deleting worker:', err);
    }
  };

  // Post handlers
  const handleCreatePost = async () => {
    try {
      await postsAPI.create(postForm);
      loadAllData();
      setPostForm({ name: '', salary: '' });
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  const handleUpdatePost = async () => {
    try {
      await postsAPI.update(editingId, postForm);
      loadAllData();
      setEditingId(null);
      setPostForm({ name: '', salary: '' });
    } catch (err) {
      console.error('Error updating post:', err);
    }
  };

  const handleDeletePost = async (id) => {
    try {
      await postsAPI.delete(id);
      loadAllData();
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  // Order handlers
  const handleUpdateOrder = async () => {
    try {
      await ordersAPI.update(editingId, orderForm);
      loadAllData();
      setEditingId(null);
      setOrderForm({ courier_id: '', customer_id: '', delivery_address: '', status: 'new' });
    } catch (err) {
      console.error('Error updating order:', err);
    }
  };

  const handleDeleteOrder = async (id) => {
    try {
      await ordersAPI.delete(id);
      loadAllData();
    } catch (err) {
      console.error('Error deleting order:', err);
    }
  };

  // Company handlers
  const handleCreateCompany = async () => {
    try {
      await companiesAPI.create(companyForm);
      loadAllData();
      setCompanyForm({ company_name: '' });
    } catch (err) {
      console.error('Error creating company:', err);
    }
  };

  const handleUpdateCompany = async () => {
    try {
      await companiesAPI.update(editingId, companyForm);
      loadAllData();
      setEditingId(null);
      setCompanyForm({ company_name: '' });
    } catch (err) {
      console.error('Error updating company:', err);
    }
  };

  const handleDeleteCompany = async (id) => {
    try {
      await companiesAPI.delete(id);
      loadAllData();
    } catch (err) {
      console.error('Error deleting company:', err);
    }
  };

  const startEdit = (item, type) => {
    setEditingId(item.id);
    switch(type) {
      case 'product': setProductForm({...item}); break;
      case 'category': setCategoryForm({...item}); break;
      case 'manufacturer': setManufacturerForm({...item}); break;
      case 'shop': setShopForm({...item}); break;
      case 'worker': setWorkerForm({...item}); break;
      case 'post': setPostForm({...item}); break;
      case 'order': setOrderForm({...item}); break;
      case 'company': setCompanyForm({...item}); break;
      default: break;
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-tabs">
        <button onClick={() => setActiveTab('products')} className={activeTab === 'products' ? 'active' : ''}>Products</button>
        <button onClick={() => setActiveTab('categories')} className={activeTab === 'categories' ? 'active' : ''}>Categories</button>
        <button onClick={() => setActiveTab('manufacturers')} className={activeTab === 'manufacturers' ? 'active' : ''}>Manufacturers</button>
        <button onClick={() => setActiveTab('shops')} className={activeTab === 'shops' ? 'active' : ''}>Shops</button>
        <button onClick={() => setActiveTab('companies')} className={activeTab === 'companies' ? 'active' : ''}>Companies</button>
        <button onClick={() => setActiveTab('workers')} className={activeTab === 'workers' ? 'active' : ''}>Workers</button>
        <button onClick={() => setActiveTab('posts')} className={activeTab === 'posts' ? 'active' : ''}>Posts</button>
        <button onClick={() => setActiveTab('orders')} className={activeTab === 'orders' ? 'active' : ''}>Orders</button>
      </div>

      <div className="admin-content">
        {activeTab === 'products' && (
          <div>
            <h3>Products</h3>
            <div className="form-group">
              <input placeholder="Name" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} />
              <input placeholder="Price" type="number" step="0.01" value={productForm.price} onChange={e => setProductForm({...productForm, price: parseFloat(e.target.value) || 0})} />
              <input placeholder="Weight (g)" type="number" step="0.001" value={productForm.weight} onChange={e => setProductForm({...productForm, weight: parseFloat(e.target.value) || null})} />
              <input placeholder="Calories" type="number" step="0.01" value={productForm.calories} onChange={e => setProductForm({...productForm, calories: parseFloat(e.target.value) || null})} />
              <textarea placeholder="Structure/Ingredients" value={productForm.structure} onChange={e => setProductForm({...productForm, structure: e.target.value})} />
              <input placeholder="Stock" type="number" value={productForm.stock_amount} onChange={e => setProductForm({...productForm, stock_amount: parseInt(e.target.value) || 0})} />
              <select value={productForm.shop_id} onChange={e => setProductForm({...productForm, shop_id: parseInt(e.target.value) || null})}>
                <option value="">Select Shop</option>
                {shops.map(s => <option key={s.id} value={s.id}>{s.address}</option>)}
              </select>
              <select value={productForm.category_id} onChange={e => setProductForm({...productForm, category_id: parseInt(e.target.value) || null})}>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={productForm.manufacturer_id} onChange={e => setProductForm({...productForm, manufacturer_id: parseInt(e.target.value) || null})}>
                <option value="">Select Manufacturer</option>
                {manufacturers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <input type="file" onChange={e => setImageFile(e.target.files[0])} />
              {editingId ? (
                <>
                  <button onClick={handleUpdateProduct}>Update</button>
                  <button onClick={() => handleUploadImage(editingId)}>Upload Image</button>
                </>
              ) : (
                <button onClick={handleCreateProduct}>Create</button>
              )}
              <button onClick={() => { setEditingId(null); setProductForm({ name: '', price: '', weight: '', calories: '', structure: '', stock_amount: 0, shop_id: '', category_id: '', manufacturer_id: '' }); }}>Cancel</button>
            </div>
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Price</th><th>Weight</th><th>Calories</th><th>Stock</th><th>Actions</th></tr></thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.name}</td>
                    <td>${p.price}</td>
                    <td>{p.weight || '-'}</td>
                    <td>{p.calories || '-'}</td>
                    <td>{p.stock_amount}</td>
                    <td>
                      <button onClick={() => startEdit(p, 'product')}>Edit</button>
                      <button onClick={() => handleDeleteProduct(p.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'categories' && (
          <div>
            <h3>Categories</h3>
            <div className="form-group">
              <input placeholder="Name" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} />
              <input placeholder="Description" value={categoryForm.description} onChange={e => setCategoryForm({...categoryForm, description: e.target.value})} />
              {editingId ? (
                <button onClick={handleUpdateCategory}>Update</button>
              ) : (
                <button onClick={handleCreateCategory}>Create</button>
              )}
              <button onClick={() => { setEditingId(null); setCategoryForm({ name: '', description: '' }); }}>Cancel</button>
            </div>
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Description</th><th>Actions</th></tr></thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.name}</td>
                    <td>{c.description}</td>
                    <td>
                      <button onClick={() => startEdit(c, 'category')}>Edit</button>
                      <button onClick={() => handleDeleteCategory(c.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'manufacturers' && (
          <div>
            <h3>Manufacturers</h3>
            <div className="form-group">
              <input placeholder="Name" value={manufacturerForm.name} onChange={e => setManufacturerForm({...manufacturerForm, name: e.target.value})} />
              <input placeholder="Contact Person" value={manufacturerForm.contact_person} onChange={e => setManufacturerForm({...manufacturerForm, contact_person: e.target.value})} />
              <input placeholder="Phone" value={manufacturerForm.phone_number} onChange={e => setManufacturerForm({...manufacturerForm, phone_number: e.target.value})} />
              <input placeholder="Email" value={manufacturerForm.email} onChange={e => setManufacturerForm({...manufacturerForm, email: e.target.value})} />
              <input placeholder="Location" value={manufacturerForm.location} onChange={e => setManufacturerForm({...manufacturerForm, location: e.target.value})} />
              {editingId ? (
                <button onClick={handleUpdateManufacturer}>Update</button>
              ) : (
                <button onClick={handleCreateManufacturer}>Create</button>
              )}
              <button onClick={() => { setEditingId(null); setManufacturerForm({ name: '', contact_person: '', phone_number: '', email: '', location: '' }); }}>Cancel</button>
            </div>
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Contact</th><th>Phone</th><th>Actions</th></tr></thead>
              <tbody>
                {manufacturers.map(m => (
                  <tr key={m.id}>
                    <td>{m.id}</td>
                    <td>{m.name}</td>
                    <td>{m.contact_person}</td>
                    <td>{m.phone_number}</td>
                    <td>
                      <button onClick={() => startEdit(m, 'manufacturer')}>Edit</button>
                      <button onClick={() => handleDeleteManufacturer(m.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'shops' && (
          <div>
            <h3>Shops</h3>
            <div className="form-group">
              <select value={shopForm.company_id} onChange={e => setShopForm({...shopForm, company_id: parseInt(e.target.value)})}>
                <option value="">Select Company</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
              </select>
              <input placeholder="Address" value={shopForm.address} onChange={e => setShopForm({...shopForm, address: e.target.value})} />
              {editingId ? (
                <button onClick={handleUpdateShop}>Update</button>
              ) : (
                <button onClick={handleCreateShop}>Create</button>
              )}
              <button onClick={() => { setEditingId(null); setShopForm({ company_id: '', address: '' }); }}>Cancel</button>
            </div>
            <table>
              <thead><tr><th>ID</th><th>Company</th><th>Address</th><th>Actions</th></tr></thead>
              <tbody>
                {shops.map(s => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{companies.find(c => c.id === s.company_id)?.company_name || 'N/A'}</td>
                    <td>{s.address}</td>
                    <td>
                      <button onClick={() => startEdit(s, 'shop')}>Edit</button>
                      <button onClick={() => handleDeleteShop(s.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'companies' && (
          <div>
            <h3>Companies</h3>
            <div className="form-group">
              <input placeholder="Company Name" value={companyForm.company_name} onChange={e => setCompanyForm({...companyForm, company_name: e.target.value})} />
              {editingId ? (
                <button onClick={handleUpdateCompany}>Update</button>
              ) : (
                <button onClick={handleCreateCompany}>Create</button>
              )}
              <button onClick={() => { setEditingId(null); setCompanyForm({ company_name: '' }); }}>Cancel</button>
            </div>
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Actions</th></tr></thead>
              <tbody>
                {companies.map(c => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.company_name}</td>
                    <td>
                      <button onClick={() => startEdit(c, 'company')}>Edit</button>
                      <button onClick={() => handleDeleteCompany(c.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'workers' && (
          <div>
            <h3>Workers</h3>
            <div className="form-group">
              <input placeholder="Full Name" value={workerForm.full_name} onChange={e => setWorkerForm({...workerForm, full_name: e.target.value})} />
              <input placeholder="Email" value={workerForm.email} onChange={e => setWorkerForm({...workerForm, email: e.target.value})} />
              <input placeholder="Phone" value={workerForm.phone_number} onChange={e => setWorkerForm({...workerForm, phone_number: e.target.value})} />
              <select value={workerForm.post_id} onChange={e => setWorkerForm({...workerForm, post_id: parseInt(e.target.value) || null})}>
                <option value="">Select Post</option>
                {posts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {editingId ? (
                <button onClick={handleUpdateWorker}>Update</button>
              ) : (
                <button onClick={handleCreateWorker}>Create</button>
              )}
              <button onClick={() => { setEditingId(null); setWorkerForm({ full_name: '', email: '', phone_number: '', post_id: '' }); }}>Cancel</button>
            </div>
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Post</th><th>Actions</th></tr></thead>
              <tbody>
                {workers.map(w => (
                  <tr key={w.id}>
                    <td>{w.id}</td>
                    <td>{w.full_name}</td>
                    <td>{w.email}</td>
                    <td>{posts.find(p => p.id === w.post_id)?.name || 'N/A'}</td>
                    <td>
                      <button onClick={() => startEdit(w, 'worker')}>Edit</button>
                      <button onClick={() => handleDeleteWorker(w.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'posts' && (
          <div>
            <h3>Posts</h3>
            <div className="form-group">
              <input placeholder="Name" value={postForm.name} onChange={e => setPostForm({...postForm, name: e.target.value})} />
              <input placeholder="Salary" type="number" value={postForm.salary} onChange={e => setPostForm({...postForm, salary: parseFloat(e.target.value)})} />
              {editingId ? (
                <button onClick={handleUpdatePost}>Update</button>
              ) : (
                <button onClick={handleCreatePost}>Create</button>
              )}
              <button onClick={() => { setEditingId(null); setPostForm({ name: '', salary: '' }); }}>Cancel</button>
            </div>
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Salary</th><th>Actions</th></tr></thead>
              <tbody>
                {posts.map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.name}</td>
                    <td>${p.salary}</td>
                    <td>
                      <button onClick={() => startEdit(p, 'post')}>Edit</button>
                      <button onClick={() => handleDeletePost(p.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h3>Orders</h3>
            <table>
              <thead><tr><th>ID</th><th>Customer</th><th>Courier</th><th>Status</th><th>Address</th><th>Actions</th></tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td>{o.id}</td>
                    <td>{o.customer?.name || 'N/A'}</td>
                    <td>{o.courier?.full_name || 'Not assigned'}</td>
                    <td>{o.status}</td>
                    <td>{o.delivery_address}</td>
                    <td>
                      <button onClick={() => startEdit(o, 'order')}>Edit</button>
                      <button onClick={() => handleDeleteOrder(o.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {editingId && activeTab === 'orders' && (
              <div className="form-group">
                <h4>Edit Order</h4>
                <select value={orderForm.courier_id || ''} onChange={e => setOrderForm({...orderForm, courier_id: parseInt(e.target.value) || null})}>
                  <option value="">Select Courier</option>
                  {workers.map(w => <option key={w.id} value={w.id}>{w.full_name}</option>)}
                </select>
                <input placeholder="Delivery Address" value={orderForm.delivery_address} onChange={e => setOrderForm({...orderForm, delivery_address: e.target.value})} />
                <select value={orderForm.status} onChange={e => setOrderForm({...orderForm, status: e.target.value})}>
                  <option value="new">New</option>
                  <option value="processing">Processing</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button onClick={handleUpdateOrder}>Update</button>
                <button onClick={() => { setEditingId(null); setOrderForm({ courier_id: '', customer_id: '', delivery_address: '', status: 'new' }); }}>Cancel</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Main App Component
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cart, setCart] = useState([]);
  const [currentPage, setCurrentPage] = useState('products');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product_id === product.id 
            ? {...item, quantity: item.quantity + 1}
            : item
        );
      }
      return [...prev, { product_id: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.product_id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? {...item, quantity: newQty} : null;
      }
      return item;
    }).filter(Boolean));
  };

  const placeOrder = async (orderData) => {
    try {
      const items = cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        name: item.name,
        price: item.price
      }));
      
      await ordersAPI.create({
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone,
        delivery_address: orderData.deliveryAddress,
        payment_bank: orderData.paymentBank,
        items: items
      });
      
      alert('Order placed successfully!');
      setCart([]);
      setCurrentPage('products');
    } catch (err) {
      console.error('Error placing order:', err);
      alert('Failed to place order');
    }
  };

  return (
    <BrowserRouter>
      <div className="app">
        <nav className="navbar">
          <h1>Retail Store</h1>
          <div className="nav-links">
            <button onClick={() => setCurrentPage('products')}>Products</button>
            <button onClick={() => setCurrentPage('cart')}>Cart ({cart.reduce((sum, i) => sum + i.quantity, 0)})</button>
            {isLoggedIn && <button onClick={() => setCurrentPage('admin')}>Admin Panel</button>}
            {!isLoggedIn ? (
              <button onClick={() => setCurrentPage('login')}>Login</button>
            ) : (
              <button onClick={handleLogout}>Logout</button>
            )}
          </div>
        </nav>
        
        <main>
          {currentPage === 'products' && <ProductsList addToCart={addToCart} />}
          {currentPage === 'cart' && <Cart cart={cart} updateQuantity={updateQuantity} placeOrder={placeOrder} />}
          {currentPage === 'login' && (isLoggedIn ? <Navigate to="/admin" /> : <Login onLogin={handleLogin} />)}
          {currentPage === 'admin' && (isLoggedIn ? <AdminPanel /> : <Navigate to="/login" />)}
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
