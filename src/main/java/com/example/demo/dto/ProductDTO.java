package com.example.demo.dto;

import lombok.Data;

@Data
public class ProductDTO {

    private Long id;
    private String title;
    private String category;
    private Double price;
    private String image;
}
