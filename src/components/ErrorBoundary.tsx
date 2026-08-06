import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-slate-800">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-3xl w-full border border-red-200">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Đã xảy ra lỗi hệ thống (Crash)</h1>
            <p className="mb-4 text-slate-600">
              Ứng dụng đã gặp lỗi không thể tự phục hồi. Xin vui lòng chụp màn hình lỗi dưới đây và gửi cho lập trình viên để xử lý.
            </p>
            <div className="bg-slate-100 p-4 rounded-lg overflow-auto max-h-96 text-sm font-mono border border-slate-300">
              <h2 className="font-bold text-red-500 mb-2">{this.state.error?.toString()}</h2>
              <pre className="whitespace-pre-wrap">{this.state.errorInfo?.componentStack}</pre>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Tải Lại Trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
