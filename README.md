# B2C Marketplace API

A comprehensive e-commerce marketplace API built with Next.js, featuring user authentication, product management, shopping cart, wishlist functionality, and more.

## Table of Contents

- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
    - [Categories](#categories)
    - [Subcategories](#subcategories)
    - [Product Types](#product-types)
    - [Products](#products)
    - [Users](#users)
    - [User Addresses](#user-addresses)
    - [Shopping Cart](#shopping-cart)
    - [Wishlist](#wishlist)
    - [Webhooks](#webhooks)
- [Error Handling](#error-handling)
- [Response Format](#response-format)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Authentication

This API uses Clerk for authentication. Most endpoints require authentication via JWT tokens.

**Headers Required:**

```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

## API Endpoints

### Categories

Manage product categories in the marketplace.

#### Get All Categories

```
GET /api/categories
```

**Response:**

```json
{
    "success": true,
    "data": [
        {
            "id": "uuid",
            "name": "Electronics",
            "slug": "electronics",
            "description": "Electronic devices and gadgets",
            "createdAt": "2024-01-01T00:00:00.000Z",
            "updatedAt": "2024-01-01T00:00:00.000Z"
        }
    ]
}
```

#### Create Category

```
POST /api/categories
```

**Request Body:**

```json
{
    "name": "Electronics",
    "description": "Electronic devices and gadgets"
}
```

**Response:**

```json
{
    "success": true,
    "message": "CREATED",
    "data": {
        "id": "uuid",
        "name": "Electronics",
        "slug": "electronics",
        "description": "Electronic devices and gadgets"
    }
}
```

#### Get Category by ID

```
GET /api/categories/[id]
```

#### Update Category

```
PATCH /api/categories/[id]
```

**Request Body:**

```json
{
    "name": "Updated Electronics",
    "description": "Updated description"
}
```

#### Delete Category

```
DELETE /api/categories/[id]
```

### Subcategories

Manage product subcategories.

#### Get All Subcategories

```
GET /api/subcategories
```

#### Create Subcategory

```
POST /api/subcategories
```

**Request Body:**

```json
{
    "name": "Smartphones",
    "description": "Mobile phones and accessories",
    "categoryId": "category-uuid"
}
```

#### Get Subcategory by ID

```
GET /api/subcategories/[id]
```

#### Update Subcategory

```
PATCH /api/subcategories/[id]
```

#### Delete Subcategory

```
DELETE /api/subcategories/[id]
```

### Product Types

Manage product types within subcategories.

#### Get All Product Types

```
GET /api/product-types
```

#### Create Product Type

```
POST /api/product-types
```

**Request Body:**

```json
{
    "name": "Android Phones",
    "description": "Android-based smartphones",
    "categoryId": "category-uuid",
    "subcategoryId": "subcategory-uuid"
}
```

#### Get Product Type by ID

```
GET /api/product-types/[id]
```

#### Update Product Type

```
PATCH /api/product-types/[id]
```

#### Delete Product Type

```
DELETE /api/product-types/[id]
```

### Products

Manage marketplace products.

#### Get All Products

```
GET /api/products
```

**Query Parameters:**

- `limit` (number): Number of products per page (default: 10)
- `page` (number): Page number (default: 1)
- `search` (string): Search query for product name/description
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `categoryId` (string): Filter by category ID
- `subcategoryId` (string): Filter by subcategory ID
- `productTypeId` (string): Filter by product type ID
- `isActive` (boolean): Filter by active status
- `isAvailable` (boolean): Filter by availability
- `isPublished` (boolean): Filter by published status
- `isDeleted` (boolean): Filter by deletion status
- `verificationStatus` (string): Filter by verification status ("pending", "approved", "rejected")
- `sortBy` (string): Sort field - "price" or "createdAt" (default: "createdAt")
- `sortOrder` (string): Sort order - "asc" or "desc" (default: "desc")

**Response:**

```json
{
    "success": true,
    "data": {
        "data": [
            {
                "id": "uuid",
                "title": "iPhone 15 Pro",
                "description": "Latest Apple smartphone",
                "price": 999.99,
                "compareAtPrice": 1099.99,
                "sku": "IPHONE15PRO",
                "nativeSku": "APPLE-IP15PRO",
                "quantity": 50,
                "isActive": true,
                "isAvailable": true,
                "isPublished": true,
                "verificationStatus": "approved",
                "categoryId": "category-uuid",
                "subcategoryId": "subcategory-uuid",
                "productTypeId": "product-type-uuid",
                "uploaderId": "user-id",
                "media": [
                    {
                        "id": "media-uuid",
                        "mediaItem": {
                            "id": "media-uuid",
                            "url": "https://example.com/image.jpg",
                            "type": "image",
                            "alt": "Product image"
                        }
                    }
                ],
                "variants": [
                    {
                        "id": "variant-uuid",
                        "sku": "IPHONE15PRO-128GB",
                        "price": 999.99,
                        "compareAtPrice": 1099.99,
                        "quantity": 25,
                        "image": "media-uuid",
                        "mediaItem": {
                            "id": "media-uuid",
                            "url": "https://example.com/variant-image.jpg"
                        },
                        "combinations": [
                            {
                                "optionId": "color-option-uuid",
                                "valueId": "black-value-uuid"
                            }
                        ]
                    }
                ],
                "options": [
                    {
                        "id": "option-uuid",
                        "name": "Color",
                        "values": [
                            {
                                "id": "value-uuid",
                                "name": "Black",
                                "value": "#000000"
                            }
                        ]
                    }
                ],
                "uploader": {
                    "id": "user-uuid",
                    "name": "John Doe",
                    "email": "john@example.com"
                },
                "category": {
                    "id": "category-uuid",
                    "name": "Electronics",
                    "slug": "electronics"
                },
                "subcategory": {
                    "id": "subcategory-uuid",
                    "name": "Smartphones",
                    "slug": "smartphones"
                },
                "productType": {
                    "id": "product-type-uuid",
                    "name": "Android Phones",
                    "slug": "android-phones"
                }
            }
        ],
        "items": 50,
        "pages": 5
    }
}
```

#### Create Product

```
POST /api/products
```

**Request Body:**

```json
{
    "title": "iPhone 15 Pro",
    "description": "Latest Apple smartphone with advanced features",
    "price": 999.99,
    "compareAtPrice": 1099.99,
    "sku": "IPHONE15PRO",
    "quantity": 50,
    "categoryId": "category-uuid",
    "subcategoryId": "subcategory-uuid",
    "productTypeId": "product-type-uuid",
    "media": ["media-uuid-1", "media-uuid-2"],
    "variants": [],
    "options": []
}
```

#### Get Product by ID

```
GET /api/products/[id]
```

#### Update Product

```
PATCH /api/products/[id]
```

#### Delete Product

```
DELETE /api/products/[id]
```

### Users

Manage users and user data.

#### Get All Users (Admin Only)

```
GET /api/users
```

**Query Parameters:**

- `limit` (number): Number of users per page (default: 10)
- `page` (number): Page number (default: 1)
- `search` (string): Search query for user name/email

**Response:**

```json
{
    "success": true,
    "data": {
        "data": [
            {
                "id": "user-uuid",
                "name": "John Doe",
                "email": "john@example.com",
                "role": "user",
                "createdAt": "2024-01-01T00:00:00.000Z",
                "addresses": []
            }
        ],
        "items": 25,
        "pages": 3
    }
}
```

#### Get Current User

```
GET /api/users/me
```

**Response:**

```json
{
    "success": true,
    "data": {
        "id": "user-uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "addresses": [
            {
                "id": "address-uuid",
                "alias": "Home",
                "fullName": "John Doe",
                "street": "123 Main St",
                "city": "New York",
                "state": "NY",
                "zip": "10001",
                "phone": "+1234567890",
                "type": "home",
                "isPrimary": true
            }
        ]
    }
}
```

### User Addresses

Manage user shipping and billing addresses.

#### Create Address

```
POST /api/users/u/[uId]/addresses
```

**Request Body:**

```json
{
    "alias": "Home",
    "fullName": "John Doe",
    "street": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "phone": "+1234567890",
    "type": "home",
    "isPrimary": true
}
```

**Response:**

```json
{
    "success": true,
    "message": "CREATED",
    "data": {
        "id": "address-uuid",
        "alias": "Home",
        "aliasSlug": "home",
        "fullName": "John Doe",
        "street": "123 Main Street",
        "city": "New York",
        "state": "NY",
        "zip": "10001",
        "phone": "+1234567890",
        "type": "home",
        "isPrimary": true,
        "userId": "user-uuid"
    }
}
```

#### Update Address

```
PATCH /api/users/u/[uId]/addresses/[aId]
```

**Request Body:** (Same as create address)

#### Delete Address

```
DELETE /api/users/u/[uId]/addresses/[aId]
```

**Notes:**

- Cannot delete primary address
- User must have at least one address
- Admin role required for deletion

### Shopping Cart

Manage user shopping carts.

#### Get User Cart

```
GET /api/carts?userId=user-id
```

**Response:**

```json
{
    "success": true,
    "data": [
        {
            "id": "cart-item-uuid",
            "userId": "user-uuid",
            "productId": "product-uuid",
            "variantId": "variant-uuid",
            "quantity": 2,
            "status": true,
            "product": {
                "id": "product-uuid",
                "title": "iPhone 15 Pro",
                "price": 999.99,
                "media": []
            },
            "variant": {
                "id": "variant-uuid",
                "sku": "IPHONE15PRO-128GB",
                "price": 999.99
            }
        }
    ]
}
```

#### Add to Cart

```
POST /api/carts
```

**Request Body:**

```json
{
    "userId": "user-uuid",
    "productId": "product-uuid",
    "variantId": "variant-uuid",
    "quantity": 1
}
```

#### Update Cart Item

```
PATCH /api/carts
```

**Request Body (Update Quantity/Status):**

```json
{
    "userId": "user-uuid",
    "productId": "product-uuid",
    "variantId": "variant-uuid",
    "quantity": 3,
    "status": true
}
```

**Request Body (Move to Wishlist):**

```json
{
    "userId": "user-uuid",
    "productId": "product-uuid",
    "variantId": "variant-uuid",
    "action": "moveToWishlist"
}
```

#### Remove from Cart

```
DELETE /api/carts?userId=user-id&ids[]=cart-item-id-1&ids[]=cart-item-id-2
```

### Wishlist

Manage user wishlists.

#### Get User Wishlist

```
GET /api/wishlists?userId=user-id
```

**Response:**

```json
{
    "success": true,
    "data": [
        {
            "id": "wishlist-item-uuid",
            "userId": "user-uuid",
            "productId": "product-uuid",
            "product": {
                "id": "product-uuid",
                "title": "iPhone 15 Pro",
                "price": 999.99,
                "media": []
            }
        }
    ]
}
```

#### Add to Wishlist

```
POST /api/wishlists
```

**Request Body:**

```json
{
    "userId": "user-uuid",
    "productId": "product-uuid"
}
```

#### Move to Cart

```
PATCH /api/wishlists
```

**Request Body:**

```json
{
    "userId": "user-uuid",
    "productId": "product-uuid",
    "variantId": "variant-uuid",
    "quantity": 1,
    "action": "moveToCart"
}
```

#### Remove from Wishlist

```
DELETE /api/wishlists?userId=user-id&productId=product-id
```

### Webhooks

#### Clerk User Webhooks

```
POST /api/webhooks/clerk
```

Handles user creation, updates, and deletion events from Clerk authentication service.

## Error Handling

The API uses consistent error responses:

```json
{
    "success": false,
    "message": "NOT_FOUND",
    "longMessage": "The requested resource was not found"
}
```

**Error Codes:**

- `BAD_REQUEST` (400): Invalid request data
- `UNAUTHORIZED` (401): Authentication required
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Resource already exists
- `UNPROCESSABLE_ENTITY` (422): Validation errors
- `TOO_MANY_REQUESTS` (429): Rate limit exceeded
- `INTERNAL_SERVER_ERROR` (500): Server error

## Response Format

All API responses follow this consistent format:

**Success Response:**

```json
{
    "success": true,
    "message": "OK",
    "data": {}
}
```

**Error Response:**

```json
{
    "success": false,
    "message": "ERROR_CODE",
    "longMessage": "Detailed error description"
}
```

## Authentication Notes

- Most endpoints require authentication via Clerk JWT tokens
- Admin-only endpoints (categories, subcategories, product types, products) require admin role
- User-specific endpoints (cart, wishlist) require user ownership validation
- API authentication can be toggled via `IS_API_AUTHENTICATED` environment variable

## Pagination

List endpoints support pagination with these query parameters:

- `page`: Page number (starts from 1)
- `limit`: Items per page
- `search`: Search query
- Various filters specific to each endpoint

## Caching

The API implements Redis caching for improved performance:

- Categories, subcategories, and product types are cached
- User carts and wishlists are cached
- Cache invalidation occurs on data modifications

---

Built with ❤️ using Next.js, TypeScript, Drizzle ORM, Redis, and Clerk Auth.
