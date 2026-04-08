"use client";

interface HomeUIProps {
  initialData?: string;
}

export default function HomeUI({ initialData }: HomeUIProps) {
  const message =
    initialData?.trim() ||
    "오늘도 충분히 잘하고 있어요! \n 천천히 가도 괜찮아요. 😉";

  return (
    <div className="w-full min-h-screen max-w-[800px]">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* 한마디 응원 카드 */}
        <section className="rounded-lg bg-white p-6 shadow-lg shadow-stone-500 ">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex sm:h-10 sm:w-10 h-8 w-8 items-center justify-center rounded-full bg-blue-100 sm:text-xl text-lg border border-stone-200">
              😃
            </div>
            <div>
              <h2 className="font-semibold">AI가 전하는 오늘의 한마디</h2>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 px-5 py-6 border border-stone-200">
            <p className="leading-7 whitespace-pre-line">{message}</p>
          </div>
        </section>

        {/* 차트 영역 자리 */}
        <section className="rounded-lg bg-white p-6 shadow-lg shadow-stone-500 ">
          <h3 className="sm:text-lg text-base font-semibold text-gray-900 mb-4">
            주간 통계
          </h3>
          <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
            차트가 들어올 영역
          </div>
        </section>
      </div>
    </div>
  );
}
