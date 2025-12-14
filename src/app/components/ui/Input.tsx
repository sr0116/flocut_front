"use client"


// input 공용 컴포넌트

type InputProps = {
//   label
  label?: string;
  // 유효성 검사 실패시 메세지
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({
                                label,
                                error,
                                ...props
                              }: InputProps) {
  return (
    <div className="space-y-1">
      {/*  label 영역*/}
      {label && (
        <label className="
          text-sm
          text-text-muted-light
          dark:text-text-muted-dark
          ">
          {label}
        </label>
      )}
      {/*  input 영역 */}
      <input
        {...props}
        className={`
        w-full h-11
        rounded-md
        // 배경색
        bg-white
        dark:bg-background-dark
        // 테두리
        border
        border-border-light
        dark:border-border-dark
        // 내부 여백
        px-3
        text-sm
        
        transition-colors
        duration-150
        ease-in-out
        
        focus:outline-none
        focus:ring-1
        focus:ring-accent
        
        // 비활성화 상태
        disabled:opacity-50
        disabled:cursor-not-allowed
        // 에러
        ${error ? "border-red-500" : ""}
        `}
      />

      {/*  error 메세지*/}
      {error && (
        <p className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  )
}
