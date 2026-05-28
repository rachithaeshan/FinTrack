package com.financeapp.finance_backend.controller;

import com.financeapp.finance_backend.entity.User;
import com.financeapp.finance_backend.entity.Transaction;
import com.financeapp.finance_backend.repository.UserRepository;
import com.financeapp.finance_backend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PutMapping("/users/{id}/block")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> blockUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setBlocked(true);
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PutMapping("/users/{id}/unblock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> unblockUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setBlocked(false);
        return ResponseEntity.ok(userRepository.save(user));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> getStats() {
        long totalUsers = userRepository.count();
        long blockedUsers = userRepository.findAll()
                .stream().filter(User::isBlocked).count();
        long totalTransactions = transactionRepository.count();

        Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("blockedUsers", blockedUsers);
        stats.put("activeUsers", totalUsers - blockedUsers);
        stats.put("totalTransactions", totalTransactions);
        return stats;
    }

    @GetMapping("/users/{id}/activity")
    @PreAuthorize("hasRole('ADMIN')")

    public Map<String, Object> getUserActivity(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Transaction> transactions = transactionRepository.findByUserId(id);

        long incomeCount = transactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.INCOME).count();
        long expenseCount = transactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.EXPENSE).count();

        java.math.BigDecimal totalIncome = transactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.INCOME)
                .map(Transaction::getAmount)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

        java.math.BigDecimal totalExpense = transactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

        Map<String, Object> userMap = new java.util.HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("name", user.getName() != null ? user.getName() : "");
        userMap.put("email", user.getEmail() != null ? user.getEmail() : "");
        userMap.put("role", user.getRole() != null ? user.getRole().name() : "USER");
        userMap.put("blocked", user.isBlocked());
        userMap.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : "");

        Map<String, Object> result = new java.util.HashMap<>();
        result.put("user", userMap);
        result.put("totalTransactions", transactions.size());
        result.put("incomeTransactions", incomeCount);
        result.put("expenseTransactions", expenseCount);
        result.put("totalIncome", totalIncome);
        result.put("totalExpense", totalExpense);

        return result;
    }
}