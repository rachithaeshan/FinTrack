package com.financeapp.finance_backend.controller;

import com.financeapp.finance_backend.entity.Transaction;
import com.financeapp.finance_backend.repository.*;
import com.financeapp.finance_backend.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {
    private final TransactionRepository transactionRepo;
    private final UserRepository userRepo;

    private User getUser(UserDetails ud) {
        return userRepo.findByEmail(ud.getUsername()).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public List<Transaction> getAll(@AuthenticationPrincipal UserDetails ud) {
        return transactionRepo.findByUserId(getUser(ud).getId());
    }

    @PostMapping
    public Transaction create(@RequestBody Transaction t, @AuthenticationPrincipal UserDetails ud) {
        t.setUser(getUser(ud));
        return transactionRepo.save(t);
    }

    @PutMapping("/{id}")
    @SuppressWarnings("null")
    public Transaction update(@PathVariable Long id, @RequestBody Transaction t,
                              @AuthenticationPrincipal UserDetails ud) {
        Transaction existing = transactionRepo.findById((long)id).orElseThrow(() -> new RuntimeException("Transaction not found"));
        existing.setTitle(t.getTitle());
        existing.setAmount(t.getAmount());
        existing.setType(t.getType());
        existing.setDate(t.getDate());
        existing.setNote(t.getNote());
        existing.setCategory(t.getCategory());
        return transactionRepo.save(existing);
    }

    @DeleteMapping("/{id}")
    @SuppressWarnings("null")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        transactionRepo.deleteById((long)id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/summary")
    public java.util.Map<String, Object> summary(@AuthenticationPrincipal UserDetails ud) {
        Long userId = getUser(ud).getId();
        java.math.BigDecimal income = transactionRepo.sumIncomeByUserId(userId);
        java.math.BigDecimal expense = transactionRepo.sumExpenseByUserId(userId);
        java.math.BigDecimal balance = (income != null ? income : java.math.BigDecimal.ZERO)
                .subtract(expense != null ? expense : java.math.BigDecimal.ZERO);
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("totalIncome", income != null ? income : 0);
        result.put("totalExpense", expense != null ? expense : 0);
        result.put("balance", balance);
        return result;
    }
}