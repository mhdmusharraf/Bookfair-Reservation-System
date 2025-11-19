package com.bookfair.stall.dto;

import lombok.Builder;
import lombok.Singular;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class StallCollectionResponse {

    @Singular
    List<StallResponse> stalls;

    @Singular("bookedId")
    List<Long> bookedIds;

    @Singular("inProgressId")
    List<Long> inProgressIds;
}
