import './App.css';
import { useMemo, useState } from 'react';

const products = [
    {
        id: 1,
        name: 'Fresh Harvest Basket',
        category: 'Groceries',
        description: 'Seasonal fruit and vegetables picked from nearby farms every morning.',
        price: 24.99,
        rating: 4.9,
        reviews: [
            'Delivered crisp and well packed.',
            'The mangoes were sweeter than expected.'
        ],
        support: 'Perfect for weekly family shopping.',
        stock: 'In stock',
        badge: 'Best seller',
        delivery: 'Same-day delivery before 6 PM',
        color: '#f97316',
        image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80'
    },
    {
        id: 2,
        name: 'Brew House Blend',
        category: 'Pantry',
        description: 'Locally roasted coffee with a smooth caramel finish and rich aroma.',
        price: 14.5,
        rating: 4.7,
        reviews: [
            'Strong but not bitter.',
            'Perfect for our breakfast counter.'
        ],
        support: 'Roasted in small batches each week.',
        stock: 'Low stock',
        badge: 'Fresh roast',
        delivery: 'Free pickup in 30 minutes',
        color: '#8b5cf6',
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80'
    },
    {
        id: 3,
        name: 'Comfort Care Set',
        category: 'Home',
        description: 'Handmade cleaning bundle with eco-friendly ingredients for everyday use.',
        price: 18.0,
        rating: 4.8,
        reviews: [
            'Gentle scent and effective cleaning.',
            'Looks premium on the shelf.'
        ],
        support: 'Reusable bottles included on request.',
        stock: 'In stock',
        badge: 'Eco choice',
        delivery: 'Next-morning delivery available',
        color: '#0ea5e9',
        image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=1200&q=80'
    },
    {
        id: 4 ,
        name: 'Daily Glow Skincare',
        category: 'Beauty',
        description: 'Gentle face wash and moisturizer bundle made for sensitive skin.',
        price: 27.4,
        rating: 4.8,
        reviews: [
            'Leaves skin hydrated without feeling heavy.',
            'Love that it is locally sourced.'
        ],
        support: 'Ask our team for routine recommendations.',
        stock: 'In stock',
        badge: 'Top rated',
        delivery: 'Ships within 24 hours',
        color: '#14b8a6',
        image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1200&q=80'
    }
];

const orders = {
    LM1024: {
        status: 'Out for delivery',
        eta: 'Today, 5:40 PM',
        progress: 92,
        note: 'Driver is 12 minutes away from the store.'
    },
    LM1008: {
        status: 'Preparing your order',
        eta: 'Today, 3:20 PM',
        progress: 58,
        note: 'Your items are being packed by the store team.'
    },
    LM0991: {
        status: 'Delivered',
        eta: 'Yesterday, 6:10 PM',
        progress: 100,
        note: 'Left at the front desk with a receipt in the bag.'
    }
};

const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
});

function formatCurrency(value) {
    return currencyFormatter.format(value);
}

const categories = ['All', ...new Set(products.map((product) => product.category))];

const productsWithImages = products;

function App() {
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('All');
    const [sortOrder, setSortOrder] = useState('featured');
    const [selectedProductId, setSelectedProductId] = useState(products[0].id);
    const [cart, setCart] = useState({});
    const [orderCode, setOrderCode] = useState('LM1024');
    const [orderMessage, setOrderMessage] = useState('');
    const [notice, setNotice] = useState('');

    const selectedProduct = productsWithImages.find((product) => product.id === selectedProductId) || productsWithImages[0];

    const visibleProducts = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        return productsWithImages
            .filter((product) => {
                const matchesSearch =
                    !query ||
                    product.name.toLowerCase().includes(query) ||
                    product.description.toLowerCase().includes(query) ||
                    product.category.toLowerCase().includes(query);
                const matchesCategory = category === 'All' || product.category === category;

                return matchesSearch && matchesCategory;
            })
            .sort((left, right) => {
                if (sortOrder === 'price-low') return left.price - right.price;
                if (sortOrder === 'price-high') return right.price - left.price;
                if (sortOrder === 'rating') return right.rating - left.rating;

                return left.id - right.id;
            });
    }, [category, searchTerm, sortOrder]);

    const cartItems = useMemo(() => {
        return Object.entries(cart)
            .map(([productId, quantity]) => {
                const product = productsWithImages.find((item) => item.id === Number(productId));

                if (!product) {
                    return null;
                }

                return {
                    ...product,
                    quantity,
                    lineTotal: product.price * quantity
                };
            })
            .filter(Boolean);
    }, [cart]);

    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cartItems.reduce((total, item) => total + item.lineTotal, 0);

    const trackedOrder = orders[orderCode.toUpperCase()];

    const addToCart = (product) => {
        setSelectedProductId(product.id);
        setCart((current) => ({
            ...current,
            [product.id]: (current[product.id] || 0) + 1
        }));
        setNotice(`${product.name} added to your cart.`);
    };

    const updateQuantity = (productId, change) => {
        setCart((current) => {
            const nextQuantity = (current[productId] || 0) + change;

            if (nextQuantity <= 0) {
                const updated = { ...current };
                delete updated[productId];
                return updated;
            }

            return {
                ...current,
                [productId]: nextQuantity
            };
        });
    };

    const handleTrackOrder = (event) => {
        event.preventDefault();

        if (!trackedOrder) {
            setOrderMessage('That order number was not found. Try LM1024, LM1008, or LM0991.');
            return;
        }

        setOrderMessage(`${trackedOrder.status} - ${trackedOrder.note}`);
    };

    const handleCheckout = () => {
        if (!cartItems.length) {
            setNotice('Add a product before checking out.');
            return;
        }

        setNotice(`Checkout ready for ${cartItems.length} items. A store associate will contact you shortly.`);
    };

    return (
        <div className="app-shell">
            <header className="hero">
                <div className="hero-copy">
                    <p className="eyebrow">Local store online</p>
                    <h1>Neighborhood Market</h1>
                    <p className="hero-text">
                        Browse fresh products, add them to your cart, and track orders from a friendly local store that
                        delivers the same day.
                    </p>
                    <div className="hero-actions">
                        <button type="button" className="primary-button" onClick={handleCheckout}>
                            Checkout cart
                        </button>
                        <span className="hero-chip">{cartCount} items in cart</span>
                        <span className="hero-chip">Free pickup available</span>
                    </div>
                </div>

                <div className="hero-panel">
                    <div>
                        <p className="panel-label">Today’s promise</p>
                        <strong>Order before 6 PM for same-day delivery.</strong>
                    </div>
                    <div className="panel-metric-row">
                        <div>
                            <span>4.8/5</span>
                            <p>Customer satisfaction</p>
                        </div>
                        <div>
                            <span>30 min</span>
                            <p>Pickup window</p>
                        </div>
                        <div>
                            <span>12</span>
                            <p>Local suppliers</p>
                        </div>
                    </div>
                    <p className="panel-note">
                        Fresh groceries, pantry staples, home essentials, and local favorites are all kept in one simple checkout.
                    </p>
                </div>
            </header>

            <main className="content-grid">
                <section className="catalog">
                    <div className="section-heading">
                        <div>
                            <p className="eyebrow">Shop products</p>
                            <h2>Browse and filter products</h2>
                        </div>
                        <p className="section-summary">Use search, sort, and category filters to quickly find what you need.</p>
                    </div>

                    <div className="toolbar">
                        <label className="field">
                            <span>Search</span>
                            <input
                                type="search"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search products or categories"
                            />
                        </label>

                        <label className="field">
                            <span>Category</span>
                            <select value={category} onChange={(event) => setCategory(event.target.value)}>
                                {categories.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="field">
                            <span>Sort by</span>
                            <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
                                <option value="featured">Featured</option>
                                <option value="price-low">Price: low to high</option>
                                <option value="price-high">Price: high to low</option>
                                <option value="rating">Top rated</option>
                            </select>
                        </label>
                    </div>

                    <div className="product-grid">
                        {visibleProducts.map((product) => (
                            <article key={product.id} className={`product-card ${selectedProduct.id === product.id ? 'active' : ''}`}>
                                <button type="button" className="card-image-button" onClick={() => setSelectedProductId(product.id)}>
                                    <img src={product.image} alt={product.name} />
                                </button>

                                <div className="card-body">
                                    <div className="card-meta-row">
                                        <span className="badge">{product.badge}</span>
                                        <span className="stock">{product.stock}</span>
                                    </div>
                                    <h3>{product.name}</h3>
                                    <p>{product.description}</p>
                                    <div className="card-footer">
                                        <strong>{formatCurrency(product.price)}</strong>
                                        <span>Rating {product.rating}</span>
                                    </div>
                                    <button type="button" className="secondary-button" onClick={() => addToCart(product)}>
                                        Add to cart
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <aside className="sidebar">
                    <section className="cart-panel">
                        <div className="section-heading compact">
                            <div>
                                <p className="eyebrow">Cart</p>
                                <h2>Your shopping cart</h2>
                            </div>
                            <span className="cart-count">{cartCount} items</span>
                        </div>

                        <div className="cart-list">
                            {cartItems.length ? (
                                cartItems.map((item) => (
                                    <div key={item.id} className="cart-item">
                                        <div>
                                            <strong>{item.name}</strong>
                                                <p>{formatCurrency(item.price)} each</p>
                                        </div>
                                        <div className="cart-controls">
                                            <button type="button" onClick={() => updateQuantity(item.id, -1)}>
                                                -
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button type="button" onClick={() => updateQuantity(item.id, 1)}>
                                                +
                                            </button>
                                        </div>
                                        <strong>{formatCurrency(item.lineTotal)}</strong>
                                    </div>
                                ))
                            ) : (
                                <p className="empty-state">Your cart is empty. Add a product from the catalog to get started.</p>
                            )}
                        </div>

                        <div className="cart-summary">
                            <div>
                                <span>Subtotal</span>
                                <strong>{formatCurrency(cartTotal)}</strong>
                            </div>
                            <div>
                                <span>Delivery</span>
                                <strong>{cartTotal > 0 ? 'Free' : formatCurrency(0)}</strong>
                            </div>
                            <button type="button" className="primary-button full-width" onClick={handleCheckout}>
                                Proceed to checkout
                            </button>
                            {notice ? <p className="status-message">{notice}</p> : null}
                        </div>
                    </section>

                    <section className="detail-panel">
                        <div className="section-heading compact">
                            <div>
                                <p className="eyebrow">Selected product</p>
                                <h2>{selectedProduct.name}</h2>
                            </div>
                        </div>
                        <p>{selectedProduct.support}</p>
                        <p>{selectedProduct.delivery}</p>
                        <div className="review-box">
                            <span>User reviews</span>
                            {selectedProduct.reviews.map((review) => (
                                <p key={review}>"{review}"</p>
                            ))}
                        </div>
                    </section>

                    <section className="tracking-panel">
                        <div className="section-heading compact">
                            <div>
                                <p className="eyebrow">Order tracking</p>
                                <h2>Track an order</h2>
                            </div>
                        </div>
                        <form className="track-form" onSubmit={handleTrackOrder}>
                            <input
                                type="text"
                                value={orderCode}
                                onChange={(event) => setOrderCode(event.target.value)}
                                placeholder="Enter order number"
                            />
                            <button type="submit" className="secondary-button">
                                Track order
                            </button>
                        </form>

                        {trackedOrder ? (
                            <div className="tracking-result">
                                <strong>{trackedOrder.status}</strong>
                                <div className="progress-bar">
                                    <span style={{ width: `${trackedOrder.progress}%` }} />
                                </div>
                                <p>ETA: {trackedOrder.eta}</p>
                                <p>{trackedOrder.note}</p>
                            </div>
                        ) : (
                            <p className="status-message">{orderMessage || 'Try LM1024, LM1008, or LM0991.'}</p>
                        )}
                    </section>

                    <section className="support-panel">
                        <div className="section-heading compact">
                            <div>
                                <p className="eyebrow">Customer support</p>
                                <h2>Need help?</h2>
                            </div>
                        </div>
                        <div className="support-item">
                            <strong>Call</strong>
                            <p>(+91) 9711001234</p>
                        </div>
                        <div className="support-item">
                            <strong>Chat</strong>
                            <p>Daily from 8 AM to 9 PM</p>
                        </div>
                        <div className="support-item">
                            <strong>Email</strong>
                            <p>support@neighborhoodmarket.local</p>
                        </div>
                    </section>
                </aside>
            </main>
        </div>
    );
}


export default App;
