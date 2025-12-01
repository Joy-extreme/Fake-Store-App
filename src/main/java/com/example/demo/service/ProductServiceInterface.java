package com.example.demo.service;

import com.example.demo.dto.ProductDTO;
import java.util.List;

public interface ProductServiceInterface {

    // API fetch/save
    List<ProductDTO> fetchProductsFromApi();
    List<ProductDTO> saveProductsFromApi();

    // CRUD operations
    List<ProductDTO> getAllProducts();
    ProductDTO createProduct(ProductDTO product);
    ProductDTO updateProduct(Long id, ProductDTO product);
    void deleteProduct(Long id);

    // Categories
    List<String> getAllCategories();
}
