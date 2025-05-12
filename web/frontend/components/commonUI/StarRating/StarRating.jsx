import React, { useState, useCallback } from "react";
import { InlineStack, Icon } from "@shopify/polaris";
import { StarFilledIcon, StarIcon } from "@shopify/polaris-icons";

const StarRating = ({ size, rating = 0, onRate }) => {
  const handleStarClick = (value) => {
    if (onRate) {
      onRate(value);
    }
  };

  const Star = () => (
    <div
      style={{
        height: `${size}px`,
        width: `${size}px`,
      }}
    >
      <StarFilledIcon />
    </div>
  );

  const OutlineStar = () => (
    <div
      style={{
        height: `${size}px`,
        width: `${size}px`,
      }}
    >
      <StarIcon />
    </div>
  );

  const HalfStar = () => (
    <div style={{ display: "grid" }}>
      <div
        style={{
          gridArea: "1/1",
          overflow: "hidden",
          width: `${Number.parseInt(size / 2)}px`,
        }}
      >
        <div
          style={{
            height: `${size}px`,
            width: `${size}px`,
          }}
        >
          <StarFilledIcon />
        </div>
      </div>
      <div style={{ gridArea: "1/1", height: `${size}px`, width: `${size}px` }}>
        <StarIcon />
      </div>
    </div>
  );

  const stars = Array.from({ length: 5 }, (_, i) => i + 1).map((star) => (
    <button
      style={{ all: "unset", cursor: "pointer" }}
      type="button"
      onClick={() => onRate(star)}
    >
      <Icon
        source={
          rating >= star
            ? Star
            : Number.parseFloat(star - rating) > 0.0 &&
              Number.parseFloat(star - rating) < 1.0
            ? HalfStar
            : OutlineStar
        }
        color="warning"
      />
    </button>
  ));

  return (
    <>
      <InlineStack gap={"2"}>{stars}</InlineStack>
    </>
  );
};

export default StarRating;
