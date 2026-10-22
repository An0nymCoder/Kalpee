package com.kalpee.entity;

public enum Priorite {
    URGENT(1),
    IMPORTANT(2),
    NORMAL(3),
    FAIBLE(4);

    private final int ordre;

    Priorite(int ordre) {
        this.ordre = ordre;
    }

    public int getOrdre() {
        return ordre;
    }
}
