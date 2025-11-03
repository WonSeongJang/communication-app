export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-sm text-gray-600">
          <p>&copy; {currentYear} 동아리 커뮤니티. All rights reserved.</p>
          <p className="mt-2">
            Made with ❤️ for our community
          </p>
        </div>
      </div>
    </footer>
  );
}
