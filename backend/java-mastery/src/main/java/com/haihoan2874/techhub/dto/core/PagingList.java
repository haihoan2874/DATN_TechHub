package com.haihoan2874.techhub.dto.core;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PagingList<E> {
    List<E> contents;

    Integer page;

    Integer size;

    Integer total;

    Integer totalPages;

    List<String> keyPaginates;

    public PagingList<E> paginate(List<E> source, Integer page, Integer size) {
        //From page 0
        this.page = page;
        this.size = size;
        this.total = source.size();
        this.totalPages = (int) Math.ceil(this.total / (double) this.size);

        if (source.isEmpty()) {
            this.contents = List.of();
            return this;
        }

        int fromIndex = this.size * this.page;
        int toIndex = Math.min(fromIndex + this.size, source.size());
        if (fromIndex < toIndex) {
            this.contents = source.subList(fromIndex, toIndex);
        } else {
            this.contents = List.of();
        }
        return this;
    }

    public PagingList<E> setDataPage(List<E> source, Integer total, Integer page, Integer size) {
        //From page 0
        this.page = page;
        this.size = size;
        this.total = total;
        this.totalPages = (int) Math.ceil(this.total / (double) this.size);

        if (source.isEmpty()) {
            this.contents = List.of();
            return this;
        }

        this.contents = source;
        return this;
    }

    public PagingList<E> setDataPage(List<E> source, Integer total, Integer page, Integer size, List<String> keyPaginates) {
        //From page 0
        this.page = page;
        this.size = size;
        this.total = total;
        this.totalPages = (int) Math.ceil(this.total / (double) this.size);
        this.keyPaginates = keyPaginates;

        if (source.isEmpty()) {
            this.contents = List.of();
            return this;
        }

        this.contents = source;
        return this;
    }
}
