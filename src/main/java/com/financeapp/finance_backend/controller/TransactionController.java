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
    private final CategoryRepository categoryRepo;

    private User getUser(UserDetails ud) {
        return userRepo.findByEmail(ud.getUsername()).orElseThrow();
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
    public Transaction update(@PathVariable Long id, @RequestBody Transaction t,
                              @AuthenticationPrincipal UserDetails ud) {
        Transaction existing = transactionRepo.findById(id).orElseThrow();
        existing.setTitle(t.getTitle());
        existing.setAmount(t.getAmount());
        existing.setType(t.getType());
        existing.setDate(t.getDate());
        existing.setNote(t.getNote());
        existing.setCategory(t.getCategory());
        return transactionRepo.save(existing);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        transactionRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/summary")
    public java.util.Map<String, Object> summary(@AuthenticationPrincipal UserDetails ud) {
        Long userId = getUser(ud).getId();
        var income = transactionRepo.sumIncomeByUserId(userId);
        var expense = transactionRepo.sumExpenseByUserId(userId);
        var balance = (income != null ? income : java.math.BigDecimal.ZERO)
                .subtract(expense != null ? expense : java.math.BigDecimal.ZERO);
        return java.util.Map.of(
                "totalIncome", income != null ? income : 0,
                "totalExpense", expense != null ? expense : 0,
                "balance", balance
        );
    }
}