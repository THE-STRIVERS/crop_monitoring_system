const products = [
    {
      id: 1,
      name: "Neem Oil",
      price: 120,
      img: "/updated_logo-removebg-preview.png",
      desc: "Organic pest repellent suitable for all crops.",
      rating: 4.5,
      ml: 500,  // Added milliliters
      brand: "NeemTech"  // Added brand
    },
    {
      id: 2,
      name: "Bayer Killer",
      price: 200,
      img: "free-nature-images.jpg",
      desc: "Fast-action pesticide for common agricultural pests.",
      rating: 4.8,
      ml: 1000,
      brand: "Bayer"
    },
    {
      id: 3,
      name: "Organic Spray",
      price: 180,
      img: "images/organic.jpg",
      desc: "Eco-friendly organic pesticide with neem base.",
      rating: 4.3,
      ml: 750,
      brand: "GreenFarm"
    },
    {
      id: 4,
      name: "EcoGuard",
      price: 220,
      img: "images/eco.jpg",
      desc: "Multipurpose spray for fungal and pest control.",
      rating: 4.6,
      ml: 1000,
      brand: "EcoFarm"
    },
    {
      id: 5,
      name: "GreenShield",
      price: 250,
      img: "images/greenshield.jpg",
      desc: "Protects crops against insects and fungus.",
      rating: 4.7,
      ml: 500,
      brand: "GreenShield"
    },
    {
      id: 6,
      name: "CropSaver Max",
      price: 300,
      img: "images/cropsaver.jpg",
      desc: "Advanced formula for intense pest infestations.",
      rating: 4.9,
      ml: 1500,
      brand: "CropSafe"
    },
    {
      id: 7,
      name: "PestAway Bio",
      price: 190,
      img: "images/pestaway.jpg",
      desc: "Bio-safe pest control for fruits and vegetables.",
      rating: 4.2,
      ml: 750,
      brand: "BioProtect"
    },
    {
      id: 8,
      name: "AgriProtect",
      price: 270,
      img: "images/agriprotect.jpg",
      desc: "Long-lasting multi-pest resistance.",
      rating: 4.4,
      ml: 1000,
      brand: "AgriCare"
    }
  ];
  
  
  const cart = [];
  const gridContainer = document.querySelector(".pesticide-grid-container");
  const cartModal = document.getElementById("cart-modal");
  const cartItems = document.getElementById("cart-items");
  const cartIcon = document.getElementById("cart-icon");
  
  // Render product cards
function renderProducts() {
    gridContainer.innerHTML = ""; // Clear the container before rendering new products
    products.forEach(product => {
      const card = document.createElement("div");
      // Set the classes for the product card: Always white background and black text color
      card.className = "bg-white text-black rounded-lg shadow-md p-6 flex flex-col items-center transition-transform transform hover:scale-105 hover:shadow-xl";
  
      // Dynamically insert product details inside the card
      card.innerHTML = `
        <div class="relative">
          <img src="${product.img}" alt="${product.name}" class="w-full h-40 object-contain mb-4 rounded-md shadow-lg transition-transform transform hover:scale-110"/>
        </div>
        <h3 class="text-md font-semibold mb-2 text-center">${product.name}</h3>
        <p class="text-sm text-gray-500 text-center mb-2">${product.desc}</p>
        <p class="text-yellow-500 mt-1 text-center">⭐ ${product.rating}</p>
        <p class="text-green-600 font-bold mt-1 text-center">₹${product.price}</p>
        <p class="text-sm text-gray-700 mt-2 text-center">Volume: ${product.ml} ml</p> <!-- Display the volume -->
        <p class="text-sm text-gray-700 mt-2 text-center">Brand: ${product.brand}</p> <!-- Display the brand -->
        <button class="mt-4 px-6 py-2 bg-green-600 text-white rounded transition-all hover:bg-green-700" onclick="addToCart(${product.id})">Add to Cart</button>
      `;
  
      gridContainer.appendChild(card); // Add the card to the grid container
    });
  }
  
  
  
  
  // Add to cart
  function addToCart(id) {
    const item = products.find(p => p.id === id);
    cart.push(item);
    updateCart();
  }
  
  // Show cart items
  function updateCart() {
    cartItems.innerHTML = "";
    cart.forEach(item => {
      const li = document.createElement("li");
      li.textContent = `${item.name} - ₹${item.price}`;
      cartItems.appendChild(li);
    });
  }
  
  // Toggle cart
  cartIcon.onclick = () => {
    cartModal.classList.toggle("hidden");
  };
  
  // Checkout
  function checkout() {
    alert("Order placed successfully!");
    cart.length = 0;
    updateCart();
    cartModal.classList.add("hidden");
  }
  
  // Dark Mode Toggle
  document.getElementById("theme-toggle").onclick = () => {
    document.body.classList.toggle("dark-mode");
  };
  
  // Dropdown redirection
  document.getElementById("moreDropdown").addEventListener("change", function () {
    const selectedValue = this.value;
    if (selectedValue) {
      window.location.href = selectedValue;
    }
  });
  
  // Live Search
  document.getElementById("searchBar").addEventListener("input", function (e) {
    const query = e.target.value.toLowerCase();
    const filteredProducts = products.filter(p =>
      p.name.toLowerCase().includes(query)
    );
    renderFilteredProducts(filteredProducts);
  });
  
  function renderFilteredProducts(filteredList) {
    gridContainer.innerHTML = "";
    filteredList.forEach(product => {
      const card = document.createElement("div");
      card.className = "bg-white text-black rounded-lg shadow-md p-6 flex flex-col items-center transition-transform transform hover:scale-105 hover:shadow-xl";
      card.innerHTML = `
        <div class="relative">
          <img src="${product.img}" alt="${product.name}" class="w-full h-40 object-contain mb-4 rounded-md shadow-lg transition-transform transform hover:scale-110"/>
        </div>
        <h3 class="text-md font-semibold mb-2 text-center">${product.name}</h3>
        <p class="text-sm text-gray-500 text-center mb-2">${product.desc}</p>
        <p class="text-yellow-500 mt-1 text-center">⭐ ${product.rating}</p>
        <p class="text-green-600 font-bold mt-1 text-center">₹${product.price}</p>
        <p class="text-sm text-gray-700 mt-2 text-center">Volume: ${product.ml} ml</p> <!-- Display the volume -->
        <p class="text-sm text-gray-700 mt-2 text-center">Brand: ${product.brand}</p> <!-- Display the brand -->
        <button class="mt-4 px-6 py-2 bg-green-600 text-white rounded transition-all hover:bg-green-700" onclick="addToCart(${product.id})">Add to Cart</button>
      `;
      gridContainer.appendChild(card);
    });
  }
  
  // Initial render
  renderProducts();
  