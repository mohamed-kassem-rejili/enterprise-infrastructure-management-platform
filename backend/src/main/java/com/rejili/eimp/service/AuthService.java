package com.rejili.eimp.service;

import com.rejili.eimp.dto.LoginRequest;
import com.rejili.eimp.dto.LoginResponse;
import com.rejili.eimp.entity.User;
import com.rejili.eimp.repository.UserRepository;
import com.rejili.eimp.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() ->
                        new BadCredentialsException("Invalid username or password"));

        if (!user.getEnabled()) {
            throw new BadCredentialsException("User account is disabled");
        }

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new BadCredentialsException("Invalid username or password");
        }

        String token = jwtService.generateToken(
                user.getUsername(),
                user.getRole().name()
        );

        return new LoginResponse(
                token,
                user.getUsername(),
                user.getRole().name()
        );
    }
}