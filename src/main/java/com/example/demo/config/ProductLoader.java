package com.example.demo.config;

import com.example.demo.model.Product;
import com.example.demo.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import java.util.Arrays;

@Component
public class ProductLoader implements CommandLineRunner {

    private final ProductRepository repository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final String FAKE_STORE_API = "https://fakestoreapi.com/products";

    public ProductLoader(ProductRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Fetch products from Fake Store API
        Product[] products = restTemplate.getForObject(FAKE_STORE_API, Product[].class);

        if (products != null && products.length > 0) {
            // Set ID to null so Hibernate generates it automatically
            Arrays.stream(products).forEach(p -> p.setId(null));

            // Save all products to DB
            repository.saveAll(Arrays.asList(products));

            System.out.println("Products loaded from API on startup.");
        }
    }
}
