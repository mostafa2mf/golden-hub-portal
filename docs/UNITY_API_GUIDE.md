# Bloggerha Backend API Guide (for Unity)

## Base URL
```
https://iketcqfmrhdpgmbacxpy.supabase.co
```

## Authentication
All requests require the `apikey` header:
```
apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrZXRjcWZtcmhkcGdtYmFjeHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1NjcwNzIsImV4cCI6MjA5MTE0MzA3Mn0.rarGwksl07_A5Aiho7skUBmmqmPP3swP96iaveYjyLY
```

For **read** operations, you also need:
```
Authorization: Bearer <same_anon_key>
```

> **Note:** INSERT operations are public (no auth needed beyond apikey).  
> READ/UPDATE/DELETE on most tables require a logged-in admin user.

---

## REST API Endpoints

### Base pattern
```
POST   https://<project>.supabase.co/rest/v1/<table>         → Insert
GET    https://<project>.supabase.co/rest/v1/<table>          → Select
PATCH  https://<project>.supabase.co/rest/v1/<table>?<filter> → Update
DELETE https://<project>.supabase.co/rest/v1/<table>?<filter> → Delete
```

### Required Headers (all requests)
```
apikey: <anon_key>
Content-Type: application/json
Prefer: return=representation   (optional, returns inserted data)
```

---

## Tables & Schemas

### 1. `categories`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | auto |
| name | text | unique, e.g. "Food" |
| name_fa | text | Persian name |

### 2. `businesses`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | auto |
| name | text | required |
| logo_url | text | URL from storage |
| category_id | uuid | FK → categories |
| city | text | |
| address | text | |
| contact_name | text | |
| phone | text | |
| email | text | |
| description | text | |
| rating | numeric(2,1) | 0-5 |
| status | enum | pending/active/suspended/rejected |
| verified | boolean | default false |

**Insert example:**
```json
POST /rest/v1/businesses
{
  "name": "کافه لاوندر",
  "city": "تهران",
  "address": "ولیعصر",
  "contact_name": "محمد",
  "phone": "021-88000000",
  "category_id": "<uuid>"
}
```

### 3. `influencers`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | auto |
| name | text | required |
| handle | text | e.g. @sara |
| avatar_url | text | URL from storage |
| followers | int | default 0 |
| engagement | numeric(4,2) | |
| city | text | |
| category_id | uuid | FK → categories |
| gender | enum | male/female/other |
| age | int | |
| bio | text | |
| status | enum | pending/active/suspended/rejected |
| verified | boolean | default false |

**Insert example:**
```json
POST /rest/v1/influencers
{
  "name": "سارا احمدی",
  "handle": "@sara.ahmadi",
  "followers": 125000,
  "engagement": 4.2,
  "city": "تهران",
  "gender": "female",
  "age": 28,
  "category_id": "<uuid>"
}
```

### 4. `campaigns`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | auto |
| title | text | required |
| business_id | uuid | FK → businesses, required |
| category_id | uuid | FK → categories |
| city | text | |
| start_date | date | |
| end_date | date | |
| budget | text | |
| description | text | |
| status | enum | pending/active/scheduled/completed/rejected/paused |
| performance | int | 0-100 |

### 5. `campaign_influencers`
| Column | Type | Notes |
|--------|------|-------|
| campaign_id | uuid | FK → campaigns |
| influencer_id | uuid | FK → influencers |

### 6. `meetings`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | auto |
| business_id | uuid | FK → businesses, required |
| influencer_id | uuid | FK → influencers, required |
| campaign_id | uuid | FK → campaigns |
| city | text | |
| location | text | |
| meeting_date | date | required |
| meeting_time | time | required |
| status | enum | pending/confirmed/cancelled/completed |
| notes | text | |

### 7. `reviews`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | auto |
| influencer_id | uuid | FK → influencers, required |
| business_id | uuid | FK → businesses, required |
| campaign_id | uuid | FK → campaigns |
| rating | int | 1-5, required |
| content | text | |
| media_urls | text[] | array of URLs |
| status | enum | pending/active/suspended/rejected |

### 8. `chat_messages`
| Column | Type | Notes |
|--------|------|-------|
| conversation_id | uuid | FK → conversations |
| sender_role | enum | influencer/business/admin |
| sender_name | text | |
| content | text | required |

### 9. `activity_log`
| Column | Type | Notes |
|--------|------|-------|
| type | text | e.g. registration, approval |
| message | text | required |
| message_fa | text | |
| icon | text | |
| entity_type | text | |
| entity_id | uuid | |

---

## File Storage

### Upload a file
```
POST https://<project>.supabase.co/storage/v1/object/<bucket>/<path>
Headers:
  apikey: <anon_key>
  Content-Type: image/jpeg (or appropriate mime type)
Body: raw file bytes
```

### Get public URL
```
https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
```

### Buckets
| Bucket | Usage |
|--------|-------|
| `avatars` | Influencer profile photos |
| `logos` | Business logos |
| `media` | Campaign media, review photos |

---

## Unity C# Example

```csharp
using UnityEngine;
using UnityEngine.Networking;
using System.Text;

public class BloggerhaAPI : MonoBehaviour
{
    const string BASE_URL = "https://iketcqfmrhdpgmbacxpy.supabase.co";
    const string API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrZXRjcWZtcmhkcGdtYmFjeHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1NjcwNzIsImV4cCI6MjA5MTE0MzA3Mn0.rarGwksl07_A5Aiho7skUBmmqmPP3swP96iaveYjyLY";

    // Register a new influencer
    public IEnumerator RegisterInfluencer(string name, string handle, int followers, string city)
    {
        var json = JsonUtility.ToJson(new {
            name = name,
            handle = handle,
            followers = followers,
            city = city,
            status = "pending"
        });

        var request = new UnityWebRequest($"{BASE_URL}/rest/v1/influencers", "POST");
        request.uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(json));
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("apikey", API_KEY);
        request.SetRequestHeader("Content-Type", "application/json");
        request.SetRequestHeader("Prefer", "return=representation");

        yield return request.SendWebRequest();

        if (request.result == UnityWebRequest.Result.Success)
            Debug.Log("Registered: " + request.downloadHandler.text);
        else
            Debug.LogError("Error: " + request.error);
    }

    // Register a new business
    public IEnumerator RegisterBusiness(string name, string city, string phone)
    {
        var json = $"{{\"name\":\"{name}\",\"city\":\"{city}\",\"phone\":\"{phone}\"}}";

        var request = new UnityWebRequest($"{BASE_URL}/rest/v1/businesses", "POST");
        request.uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(json));
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("apikey", API_KEY);
        request.SetRequestHeader("Content-Type", "application/json");
        request.SetRequestHeader("Prefer", "return=representation");

        yield return request.SendWebRequest();

        if (request.result == UnityWebRequest.Result.Success)
            Debug.Log("Registered: " + request.downloadHandler.text);
        else
            Debug.LogError("Error: " + request.error);
    }

    // Upload avatar
    public IEnumerator UploadAvatar(string fileName, byte[] fileData)
    {
        var request = new UnityWebRequest($"{BASE_URL}/storage/v1/object/avatars/{fileName}", "POST");
        request.uploadHandler = new UploadHandlerRaw(fileData);
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("apikey", API_KEY);
        request.SetRequestHeader("Content-Type", "image/jpeg");

        yield return request.SendWebRequest();

        if (request.result == UnityWebRequest.Result.Success)
        {
            string publicUrl = $"{BASE_URL}/storage/v1/object/public/avatars/{fileName}";
            Debug.Log("Avatar URL: " + publicUrl);
        }
    }
}
```

---

## Flow Summary

1. **Unity app** → INSERT into `businesses` / `influencers` (status: `pending`)
2. **Admin panel** → sees new pending items in Approvals page
3. **Admin** → approves/rejects → updates `status` + creates `approvals` record
4. **Unity app** → can query status of its records

## Realtime (Optional)
Tables with realtime enabled can push changes to Unity via WebSocket.
