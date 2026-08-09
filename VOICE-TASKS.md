# Adding tasks by voice (Siri Shortcut)

Once set up: **"Hey Siri, add task"** → you speak → it's in SUCCESS next time you open it.

Takes about 10 minutes to build once. No coding.

---

## What you'll need

Your Firebase Web API key (the same `apiKey` from your config):

```
AIzaSyD2wDf2rdxNGG095Jz5CDRYlymS2d8e0wY
```

And the email + password you use to sign into SUCCESS.

---

## Build the Shortcut

Open the **Shortcuts** app → **+** to create a new one. Add these actions in order.

### 1. Ask for the task

- Add action: **Ask for Input**
- Input type: **Text**
- Prompt: `What's the task?`

### 2. Sign in to get a token

- Add action: **Get Contents of URL**
- URL:
  ```
  https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyD2wDf2rdxNGG095Jz5CDRYlymS2d8e0wY
  ```
- Tap the arrow to expand options:
  - Method: **POST**
  - Request Body: **JSON**
  - Add three text fields:
    - `email` → your SUCCESS email
    - `password` → your SUCCESS password
    - `returnSecureToken` → `true`

### 3. Pull the token out

- Add action: **Get Dictionary Value**
- Get **Value** for key: `idToken`
- From: the **Contents of URL** result above

### 4. Write the task

- Add action: **Get Contents of URL**
- URL — note the `documentId` uses the current time so each task is unique:
  ```
  https://firestore.googleapis.com/v1/projects/vc-life-success/databases/(default)/documents/grindlog?documentId=inbox%3A
  ```
  Then tap at the very end of that URL and insert a **Current Date** variable,
  formatted as **Unix Time** (tap the variable → Format → Unix Time).
- Expand options:
  - Method: **POST**
  - Headers: add one —
    - Key: `Authorization`
    - Value: `Bearer ` then insert the **Dictionary Value** from step 3
      (make sure there's a space after `Bearer`)
  - Request Body: **JSON**, structured like this:
    - `fields` (Dictionary) →
      - `value` (Dictionary) →
        - `stringValue` (Text) → the **Provided Input** from step 1
      - `key` (Dictionary) →
        - `stringValue` (Text) → type `inbox:` then insert **Current Date** (Unix Time)

### 5. Name it

Tap the shortcut name at the top → rename to **Add Task**.
That's the phrase Siri will listen for.

---

## Using it

- **"Hey Siri, Add Task"** → speak the task
- Or add it to your Home Screen / Lock Screen
- Or map it to the **Action Button** if your iPhone has one

Next time you open SUCCESS and hit the Tasks tab, anything captured shows up in
Today with a note saying how many came in.

---

## Setting priority and bucket by voice

If you want more control, change step 4's `stringValue` for `value` from plain
text to a JSON string like:

```
{"text":"PROVIDED INPUT","priority":1,"bucket":"today"}
```

Buckets: `today`, `tomorrow`, `week`, `personal`. Priority: `1`–`5`.

Simplest approach is to make two shortcuts — "Add Task" for normal, and
"Add Urgent Task" with `"priority":1` baked in.

---

## Quick alternative: keyboard dictation

You don't need any of this for one-off capture. Open SUCCESS, tap the task
field, and hit the **microphone** on the iOS keyboard. Speak, tap Add. Works
today, nothing to set up.

The Shortcut's advantage is that you never have to open the app at all.
