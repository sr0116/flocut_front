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
  ...props}: InputProps) {
  return (
    <div className="space-y-1">
    {/*  label 영역*/}
    </div>
  )
}
