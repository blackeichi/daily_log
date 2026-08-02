"use client";

import { useEffect, useMemo, useState } from "react";
import { useSetAtom } from "jotai";
import {
  FiArrowDownLeft,
  FiArrowUpRight,
  FiCheck,
  FiDollarSign,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import QueryRetry from "@/components/molecules/QueryRetry";
import { errorAtom } from "@/lib/atom";
import { useBudget, useUpdateBudget } from "@/lib/hooks/useBudget";
import type { Budget, BudgetItem } from "@/types/api";

const won = new Intl.NumberFormat("ko-KR");
const EMPTY_BUDGET: Budget = {
  id: 0,
  salary: 0,
  fixedIncomes: [],
  fixedExpenses: [],
  updatedAt: null,
};

function newItem(): BudgetItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: "",
    amount: 0,
  };
}

function parseMoney(value: string) {
  const number = Number(value.replace(/[^0-9]/g, ""));
  return Math.min(Number.isFinite(number) ? number : 0, 1_000_000_000);
}

function MoneyInput({
  value,
  onChange,
  label,
  large = false,
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
  large?: boolean;
}) {
  return (
    <div className="relative">
      <input
        inputMode="numeric"
        aria-label={label}
        value={value ? won.format(value) : ""}
        placeholder="0"
        onChange={(event) => onChange(parseMoney(event.target.value))}
        className={`w-full rounded-xl border border-stone-200 bg-white pr-9 text-right font-semibold text-stone-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 ${
          large ? "h-14 px-4 text-xl sm:text-2xl" : "h-10 px-3 text-sm"
        }`}
      />
      <span
        className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 ${large ? "text-sm" : "text-xs"}`}
      >
        원
      </span>
    </div>
  );
}

function ItemList({
  title,
  description,
  items,
  tone,
  onChange,
}: {
  title: string;
  description: string;
  items: BudgetItem[];
  tone: "income" | "expense";
  onChange: (items: BudgetItem[]) => void;
}) {
  const isIncome = tone === "income";
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  const update = (id: string, patch: Partial<BudgetItem>) =>
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  return (
    <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-stone-100 px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
              isIncome
                ? "bg-blue-50 text-blue-700"
                : "bg-orange-50 text-orange-700"
            }`}
          >
            {isIncome ? <FiArrowDownLeft size={18} /> : <FiArrowUpRight size={18} />}
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-stone-900 sm:text-base">{title}</h2>
            <p className="mt-0.5 truncate text-[11px] text-stone-500 sm:text-xs">
              {description}
            </p>
          </div>
        </div>
        <p className="ml-3 whitespace-nowrap text-sm font-bold text-stone-800">
          {won.format(total)}원
        </p>
      </div>

      <div className="divide-y divide-stone-100">
        {items.length === 0 && (
          <div className="px-4 py-8 text-center text-xs text-stone-400">
            아직 등록된 항목이 없습니다.
          </div>
        )}
        {items.map((item, index) => (
          <div
            key={item.id}
            className="grid grid-cols-[1fr_40px] gap-2 px-4 py-3 sm:grid-cols-[minmax(120px,1fr)_minmax(140px,0.8fr)_36px] sm:items-center sm:px-5"
          >
            <input
              aria-label={`${title} ${index + 1} 이름`}
              value={item.name}
              maxLength={40}
              placeholder={isIncome ? "예: 부수입" : "예: 월세"}
              onChange={(event) => update(item.id, { name: event.target.value })}
              className="h-10 min-w-0 rounded-xl border border-stone-200 px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
            <button
              type="button"
              aria-label={`${item.name || `${index + 1}번째 항목`} 삭제`}
              onClick={() => onChange(items.filter((current) => current.id !== item.id))}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-stone-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500 sm:order-last sm:h-9 sm:w-9"
            >
              <FiTrash2 size={16} />
            </button>
            <MoneyInput
              label={`${title} ${item.name || index + 1} 금액`}
              value={item.amount}
              onChange={(amount) => update(item.id, { amount })}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onChange([...items, newItem()])}
        className="flex w-full items-center justify-center gap-1.5 border-t border-stone-100 py-3 text-xs font-semibold text-stone-600 transition hover:bg-stone-50 hover:text-stone-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-stone-500"
      >
        <FiPlus size={15} aria-hidden="true" /> 항목 추가
      </button>
    </section>
  );
}

export default function BudgetUI({ initialData }: { initialData?: Budget }) {
  const setError = useSetAtom(errorAtom);
  const { data, isLoading, isError, isFetching, refetch } = useBudget(
    initialData ? { initialData } : undefined,
  );
  const updateBudget = useUpdateBudget();
  const [form, setForm] = useState<Budget>(initialData ?? EMPTY_BUDGET);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const totals = useMemo(() => {
    const extraIncome = form.fixedIncomes.reduce((sum, item) => sum + item.amount, 0);
    const expenses = form.fixedExpenses.reduce((sum, item) => sum + item.amount, 0);
    const income = form.salary + extraIncome;
    return {
      income,
      expenses,
      available: income - expenses,
      ratio: income > 0 ? Math.min((expenses / income) * 100, 100) : 0,
    };
  }, [form]);

  const handleSave = async () => {
    const hasBlankName = [...form.fixedIncomes, ...form.fixedExpenses].some(
      (item) => !item.name.trim(),
    );
    if (hasBlankName) {
      setError("항목 이름을 입력해주세요.");
      return;
    }

    try {
      await updateBudget.mutateAsync({
        salary: form.salary,
        fixedIncomes: form.fixedIncomes,
        fixedExpenses: form.fixedExpenses,
      });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } catch (error) {
      setError(error instanceof Error ? error.message : "저장하지 못했습니다.");
    }
  };

  if (isError) {
    return (
      <div className="w-full max-w-[900px] pt-4">
        <QueryRetry
          message="고정지출 정보를 불러오지 못했습니다."
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      </div>
    );
  }

  if (isLoading) {
    return <div className="mt-4 h-96 w-full max-w-[900px] animate-pulse rounded-2xl bg-white" />;
  }

  return (
    <div className="flex w-full max-w-[900px] flex-col gap-4 pb-24 pt-4 sm:gap-5 sm:pb-10">
      <header className="flex items-end justify-between border-b border-stone-300 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white">
            <FiDollarSign size={19} aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-lg font-bold text-stone-900 sm:text-xl">월 고정 재정</h1>
            <p className="mt-0.5 text-xs text-stone-500">매달 반복되는 수입과 지출을 정리해보세요.</p>
          </div>
        </div>
      </header>

      <section className="grid gap-4 rounded-2xl bg-stone-800 p-4 text-white shadow-sm sm:grid-cols-[1.15fr_1fr] sm:p-6">
        <div>
          <p className="text-xs font-medium text-stone-300">매월 받는 월급</p>
          <div className="mt-2 max-w-sm">
            <MoneyInput
              label="월급"
              value={form.salary}
              onChange={(salary) => setForm((current) => ({ ...current, salary }))}
              large
            />
          </div>
          <p className="mt-3 text-[11px] text-stone-400">세후 실수령액 기준으로 입력하면 더 정확해요.</p>
        </div>
        <div className="rounded-xl bg-white/10 p-4">
          <div className="flex items-center justify-between text-xs text-stone-300">
            <span>고정지출 비율</span>
            <span className="font-semibold text-white">{totals.ratio.toFixed(1)}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15">
            <div
              className={`h-full rounded-full transition-all ${
                totals.ratio >= 70 ? "bg-orange-400" : "bg-emerald-400"
              }`}
              style={{ width: `${totals.ratio}%` }}
            />
          </div>
          <p className="mt-4 text-xs text-stone-300">고정비를 제외하고 쓸 수 있는 금액</p>
          <p className={`mt-1 text-xl font-bold ${totals.available < 0 ? "text-orange-300" : "text-white"}`}>
            {totals.available < 0 ? "-" : ""}{won.format(Math.abs(totals.available))}원
          </p>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-2 sm:gap-3" aria-label="월 재정 요약">
        {[
          ["월 고정수입", totals.income, "text-blue-700"],
          ["월 고정지출", totals.expenses, "text-orange-700"],
          ["예상 잔액", totals.available, totals.available < 0 ? "text-red-700" : "text-emerald-700"],
        ].map(([label, value, color]) => (
          <div key={String(label)} className="rounded-xl border border-stone-200 bg-white p-3 sm:p-4">
            <p className="truncate text-[10px] text-stone-500 sm:text-xs">{label}</p>
            <p className={`mt-1 truncate text-xs font-bold sm:text-lg ${color}`}>
              {won.format(Number(value))}원
            </p>
          </div>
        ))}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <ItemList
          title="고정수입"
          description="월급 외에 정기적으로 들어오는 돈"
          items={form.fixedIncomes}
          tone="income"
          onChange={(fixedIncomes) => setForm((current) => ({ ...current, fixedIncomes }))}
        />
        <ItemList
          title="고정지출"
          description="주거비, 구독료, 보험료 등"
          items={form.fixedExpenses}
          tone="expense"
          onChange={(fixedExpenses) => setForm((current) => ({ ...current, fixedExpenses }))}
        />
      </div>

      <div className="sticky bottom-16 z-10 flex justify-end sm:bottom-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={updateBudget.isPending}
          className="flex h-12 min-w-36 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-wait disabled:bg-stone-400"
        >
          <FiCheck size={17} aria-hidden="true" />
          {updateBudget.isPending ? "저장 중..." : saved ? "저장했어요" : "저장하기"}
        </button>
      </div>
    </div>
  );
}
