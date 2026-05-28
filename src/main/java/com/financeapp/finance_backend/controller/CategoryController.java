package com.financeapp.finance_backend.controller;

import com.financeapp.finance_backend.entity.*;
import com.financeapp.finance_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryRepository categoryRepo;
    private final UserRepository userRepo;

    private User getUser(UserDetails ud) { return userRepo.findByEmail(ud.getUsername()).orElseThrow(() -> new RuntimeException("User not found")); }

    @GetMapping
    public List<Category> getAll(@AuthenticationPrincipal UserDetails ud) {
        return categoryRepo.findByUserId(getUser(ud).getId());
    }

    @PostMapping
    public Category create(@RequestBody Category c, @AuthenticationPrincipal UserDetails ud) {
        c.setUser(getUser(ud));
        return categoryRepo.save(c);
    }

    @PutMapping("/{id}")
    @SuppressWarnings("null")
    public Category update(@PathVariable Long id, @RequestBody Category c) {
        Category existing = categoryRepo.findById((long)id).orElseThrow(() -> new RuntimeException("User not found"));
        existing.setName(c.getName());
        existing.setType(c.getType());
        return categoryRepo.save(existing);
    }

    @DeleteMapping("/{id}")
    @SuppressWarnings("null")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        categoryRepo.deleteById((long)id);
        return ResponseEntity.noContent().build();
    }
}