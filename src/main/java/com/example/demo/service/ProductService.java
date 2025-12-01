package com.example.demo.service;

import com.example.demo.dto.ProductDTO;
import com.example.demo.mapper.ProductMapper;
import com.example.demo.model.Product;
import com.example.demo.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService implements ProductServiceInterface {

    private final ProductRepository repository;
    private final ProductMapper mapper;
    private final RestTemplate restTemplate = new RestTemplate();
    private final String FAKE_STORE_API = "https://fakestoreapi.com/products";

    @Autowired
    public ProductService(ProductRepository repository, ProductMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    // 1️⃣ Fetch products from API and return as DTOs
    @Override
    public List<ProductDTO> fetchProductsFromApi() {
        Product[] products = restTemplate.getForObject(FAKE_STORE_API, Product[].class);
        return Arrays.stream(products)
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    // 2️⃣ Save API products to MySQL and return as DTOs
    @Override
    public List<ProductDTO> saveProductsFromApi() {
        List<Product> apiProducts = Arrays.asList(
                restTemplate.getForObject(FAKE_STORE_API, Product[].class)
        );
        List<Product> savedProducts = repository.saveAll(apiProducts);
        return savedProducts.stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    // 3️⃣ Get all products from DB
    @Override
    public List<ProductDTO> getAllProducts() {
        return repository.findAll()
                .stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    // 4️⃣ Create new product
    @Override
    public ProductDTO createProduct(ProductDTO dto) {
        Product product = mapper.toEntity(dto);
        Product saved = repository.save(product);
        return mapper.toDTO(saved);
    }

    // 5️⃣ Update existing product
    @Override
    public ProductDTO updateProduct(Long id, ProductDTO dto) {
        Product product = mapper.toEntity(dto);
        product.setId(id);
        Product updated = repository.save(product);
        return mapper.toDTO(updated);
    }

    // 6️⃣ Delete product
    @Override
    public void deleteProduct(Long id) {
        repository.deleteById(id);
    }

    // 7️⃣ Get all distinct categories
    @Override
    public List<String> getAllCategories() {
        return repository.findAll()
                .stream()
                .map(Product::getCategory)
                .distinct()
                .collect(Collectors.toList());
    }
}
