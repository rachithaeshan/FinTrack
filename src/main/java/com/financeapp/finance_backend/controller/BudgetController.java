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
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {
    private final BudgetRepository budgetRepo;
    private final UserRepository userRepo;

    private User getUser(UserDetails ud) { return userRepo.findByEmail(ud.getUsername()).orElseThrow(() -> new RuntimeException("User not found")); }

    @GetMapping
    public List<Budget> getAll(@AuthenticationPrincipal UserDetails ud) {
        return budgetRepo.findByUserId(getUser(ud).getId());
    }

    @PostMapping
    public Budget create(@RequestBody Budget b, @AuthenticationPrincipal UserDetails ud) {
        b.setUser(getUser(ud));
        return budgetRepo.save(b);
    }

    @PutMapping("/{id}")
    @SuppressWarnings("null")
    public Budget update(@PathVariable Long id, @RequestBody Budget b) {
        Budget existing = budgetRepo.findById((long)id).orElseThrow(() -> new RuntimeException("Budget not found"));
        existing.setAmount(b.getAmount());
        existing.setCategory(b.getCategory());
        return budgetRepo.save(existing);
    }

    @DeleteMapping("/{id}")
    @SuppressWarnings("null")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        budgetRepo.deleteById((long)id);
        return ResponseEntity.noContent().build();
    }
}