package com.example.demo.service;


import com.example.demo.dto.LoginResponseDTO;
import com.example.demo.dto.UserDTO;

public interface UserServiceInterface {
    String register(UserDTO dto);
    LoginResponseDTO login(UserDTO dto);
}
