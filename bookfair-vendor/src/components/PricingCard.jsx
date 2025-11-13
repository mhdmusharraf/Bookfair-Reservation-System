// src/components/PricingCard.jsx
import React, { useMemo } from "react";
import {
  Paper, Stack, Typography, Chip, Divider, Box, Avatar, Tooltip,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";

export default function PricingCard({ selectedStalls }) {
  const PRICES = { SMALL: 40000, MEDIUM: 70000, LARGE: 100000 };
  const currency = useMemo(
    () => new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }),
    []
  );

  const counts = useMemo(() => {
    const acc = { SMALL: 0, MEDIUM: 0, LARGE: 0 };
    if (selectedStalls?.size) {
      for (const v of selectedStalls.values()) {
        const size = v?.stall?.size;
        if (size && acc[size] !== undefined) acc[size] += 1;
      }
    }
    return acc;
  }, [selectedStalls]);

  const estimatedTotal =
    counts.SMALL * PRICES.SMALL +
    counts.MEDIUM * PRICES.MEDIUM +
    counts.LARGE * PRICES.LARGE;

  const plans = [
    {
      key: "SMALL",
      title: "Small",
      price: PRICES.SMALL,
      selected: counts.SMALL,
      hint: "Standard footprint, basic utilities",
      icon: StorefrontOutlinedIcon,
      chipColor: "success",
      accent: (t) => t.palette.success.main,
      highlight: false,
    },
    {
      key: "MEDIUM",
      title: "Medium",
      price: PRICES.MEDIUM,
      selected: counts.MEDIUM,
      hint: "Extra width, better frontage",
      icon: TrendingUpOutlinedIcon,
      chipColor: "primary",
      accent: (t) => t.palette.primary.main,
      highlight: true, // minimized chip appears here
    },
    {
      key: "LARGE",
      title: "Large",
      price: PRICES.LARGE,
      selected: counts.LARGE,
      hint: "Premium area, corner visibility",
      icon: WorkspacePremiumOutlinedIcon,
      chipColor: "warning",
      accent: (t) => t.palette.warning.main,
      highlight: false,
    },
  ];

  return (
    <Paper
      sx={(t) => ({
        position: "relative",
        p: 2.5,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        backgroundImage: `
          radial-gradient(1000px 400px at 10% 0%, ${alpha(t.palette.primary.main, 0.12)} 0%, transparent 60%),
          radial-gradient(800px 300px at 90% 10%, ${alpha(t.palette.secondary?.main || t.palette.info.main, 0.10)} 0%, transparent 70%),
          linear-gradient(180deg, ${t.palette.background.paper} 0%, ${t.palette.background.default} 100%)
        `,
        boxShadow: `0 10px 30px ${alpha(t.palette.primary.main, 0.12)}`,
        overflow: "hidden",
        "&:before": {
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(${alpha(t.palette.primary.main, 0.08)} 1px, transparent 1px)`,
          backgroundSize: "14px 14px",
          maskImage: "linear-gradient(to bottom, black, transparent 70%)",
          pointerEvents: "none",
        },
      })}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={900}>Stall Pricing</Typography>
        <Typography variant="body2" color="text.secondary">All amounts in LKR</Typography>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        {plans.map((p) => (
          <PlanCard key={p.key} {...p} currency={currency} />
        ))}
      </Stack>

      <Divider sx={{ my: 2 }} />
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={1.5}
      >
        <Stack direction="row" gap={1} flexWrap="wrap">
          <Chip size="small" label={`Small × ${counts.SMALL}`} />
          <Chip size="small" label={`Medium × ${counts.MEDIUM}`} />
          <Chip size="small" label={`Large × ${counts.LARGE}`} />
        </Stack>
        <Stack direction="row" alignItems="baseline" gap={1}>
          <Typography variant="subtitle2" color="text.secondary">Estimated Total:</Typography>
          <Typography variant="h6" fontWeight={900}>{currency.format(estimatedTotal)}</Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}

function PlanCard({ title, price, selected, hint, icon: Icon, chipColor, accent, highlight, currency }) {
  return (
    <Paper
      sx={(t) => ({
        position: "relative",
        flex: 1,
        p: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        background: `
          linear-gradient(180deg, ${alpha(accent(t), 0.06)} 0%, transparent 100%),
          ${t.palette.background.paper}
        `,
        overflow: "hidden",
        transition: "transform .12s ease, box-shadow .12s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: `0 14px 36px ${alpha(accent(t), 0.22)}`,
        },
      })}
    >
      <Box
        sx={(t) => ({
          position: "absolute", top: 0, left: 0, right: 0, height: 3,
          bgcolor: alpha(accent(t), 0.75),
        })}
      />

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1.25}>
          <Avatar
            variant="circular"
            sx={(t) => ({
              width: 36, height: 36,
              bgcolor: alpha(accent(t), 0.12),
              color: accent(t),
              border: `1px solid ${alpha(accent(t), 0.4)}`,
              fontWeight: 900,
            })}
          >
            <Icon fontSize="small" />
          </Avatar>
          <Typography variant="subtitle1" fontWeight={900}>{title}</Typography>
        </Stack>

        <Stack direction="row" spacing={1}>
          {highlight && (
            <Chip
              size="small"
              variant="outlined"
              label="Most popular"
              // ↓ Minimized visual weight
              sx={(t) => ({
                height: 22,
                borderColor: alpha(accent(t), 0.4),
                color: alpha(accent(t), 0.9),
                backgroundColor: alpha(accent(t), 0.06),
                fontWeight: 700,
                "& .MuiChip-label": { px: 0.75, py: 0, fontSize: 11, lineHeight: "20px" },
              })}
            />
          )}
          <Chip
            size="small"
            label={`Selected: ${selected}`}
            color={selected > 0 ? chipColor : "default"}
            sx={{ fontWeight: 700 }}
          />
        </Stack>
      </Stack>

      <Typography variant="h5" fontWeight={900} sx={{ lineHeight: 1.2 }}>
        {currency.format(price)}
      </Typography>

      <Tooltip title={hint} arrow placement="top">
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.25 }}>
          {hint}
        </Typography>
      </Tooltip>
    </Paper>
  );
}
