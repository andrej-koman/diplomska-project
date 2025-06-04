using System.Collections.Concurrent;

namespace diplomska.Server.Services
{
    public class TwoFactorCodeService
    {
        private readonly ConcurrentDictionary<string, (string Code, DateTime Expiry)> _codes = new();
        
        public string GenerateCode()
        {
            return new Random().Next(100000, 999999).ToString();
        }
        
        public void StoreCode(string userId, string code)
        {
            var expiry = DateTime.UtcNow.AddMinutes(5); // Code valid for 5 minutes
            _codes.AddOrUpdate(userId, (code, expiry), (key, value) => (code, expiry));
        }
        
        public bool ValidateCode(string userId, string code)
        {
            if (_codes.TryGetValue(userId, out var storedData))
            {
                if (DateTime.UtcNow <= storedData.Expiry && storedData.Code == code)
                {
                    _codes.TryRemove(userId, out _); // Remove used code
                    return true;
                }
                
                // Remove expired code
                if (DateTime.UtcNow > storedData.Expiry)
                {
                    _codes.TryRemove(userId, out _);
                }
            }
            
            return false;
        }
        
        public void RemoveCode(string userId)
        {
            _codes.TryRemove(userId, out _);
        }
    }
}
