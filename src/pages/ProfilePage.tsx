import {
  useEffect,
  useRef,
  useState,
} from 'react'

import type {
  ChangeEvent,
  FormEvent,
} from 'react'

import {
  LuCamera,
  LuCheck,
  LuEye,
  LuEyeOff,
  LuLockKeyhole,
  LuSave,
  LuShieldCheck,
  LuTrash2,
  LuUserRound,
} from 'react-icons/lu'

import {
  supabase,
} from '../utils/supabase'

import AppHeader from '../components/AppHeader'

type Language =
  | 'en'
  | 'es'

interface ProfilePageProps {
  language: Language

  onLanguageChange: (
    language: Language,
  ) => void

  onBack: () => void
  onSignOut: () => void
}

interface ProfileRow {
  id: string
  display_name: string | null
  avatar_path: string | null
  bio: string | null
}

const translations = {
  en: {
    back: 'Campaigns',
    profile: 'Profile',
    eyebrow: 'Your account',
    title: 'Your profile',
    intro:
      'Manage how you appear in Campaign Chronicles and keep your account secure.',
    personalInfo: 'Profile information',
    personalInfoText:
      'Your profile is global. Character information belongs to each campaign.',
    avatar: 'Profile picture',
    uploadAvatar: 'Choose image',
    removeAvatar: 'Remove',
    avatarHint: 'JPG, PNG or WebP. Maximum 3 MB.',
    displayName: 'Display name',
    displayNamePlaceholder: 'How should we call you?',
    bio: 'About you',
    bioPlaceholder:
      'A short introduction, your favorite games, your role at the table...',
    bioHint: 'Optional · maximum 300 characters',
    email: 'Email',
    emailHint:
      'Your account email is managed by Supabase Auth.',
    saveProfile: 'Save profile',
    savingProfile: 'Saving...',
    profileSaved: 'Profile saved.',
    profileError: 'We could not save your profile.',
    loadError: 'We could not load your profile.',
    avatarError: 'We could not update your profile picture.',
    avatarTooLarge: 'The image must be 3 MB or smaller.',
    avatarTypeError: 'Choose a JPG, PNG or WebP image.',
    security: 'Security',
    securityText:
      'Change your password whenever you need to.',
    newPassword: 'New password',
    confirmPassword: 'Confirm new password',
    changePassword: 'Change password',
    changingPassword: 'Changing password...',
    passwordChanged: 'Password changed successfully.',
    passwordMismatch: 'The passwords do not match.',
    passwordInvalid:
      'Your password does not meet all security requirements.',
    passwordError: 'We could not change your password.',
    passwordSecurity: 'Strength',
    strengthEmpty: 'Enter a password',
    strengthVeryWeak: 'Very weak',
    strengthWeak: 'Weak',
    strengthGood: 'Good',
    strengthStrong: 'Strong',
    strengthVeryStrong: 'Very strong',
    requirementLength: 'At least 8 characters',
    requirementUppercase: 'One uppercase letter',
    requirementLowercase: 'One lowercase letter',
    requirementNumber: 'One number',
    requirementSymbol: 'One symbol',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    signOut: 'Sign out',
    loading: 'Loading profile...',
  },

  es: {
    back: 'Campañas',
    profile: 'Perfil',
    eyebrow: 'Tu cuenta',
    title: 'Tu perfil',
    intro:
      'Administrá cómo aparecés en Campaign Chronicles y mantené segura tu cuenta.',
    personalInfo: 'Información de perfil',
    personalInfoText:
      'Tu perfil es global. La información de tus personajes pertenece a cada campaña.',
    avatar: 'Foto de perfil',
    uploadAvatar: 'Elegir imagen',
    removeAvatar: 'Eliminar',
    avatarHint: 'JPG, PNG o WebP. Máximo 3 MB.',
    displayName: 'Nombre visible',
    displayNamePlaceholder: '¿Cómo querés que te llamemos?',
    bio: 'Sobre vos',
    bioPlaceholder:
      'Una breve presentación, tus juegos favoritos, tu rol en la mesa...',
    bioHint: 'Opcional · máximo 300 caracteres',
    email: 'Correo electrónico',
    emailHint:
      'El correo de tu cuenta se administra desde Supabase Auth.',
    saveProfile: 'Guardar perfil',
    savingProfile: 'Guardando...',
    profileSaved: 'Perfil guardado.',
    profileError: 'No pudimos guardar tu perfil.',
    loadError: 'No pudimos cargar tu perfil.',
    avatarError: 'No pudimos actualizar tu foto de perfil.',
    avatarTooLarge: 'La imagen debe pesar 3 MB o menos.',
    avatarTypeError: 'Elegí una imagen JPG, PNG o WebP.',
    security: 'Seguridad',
    securityText:
      'Cambiá tu contraseña cuando lo necesites.',
    newPassword: 'Nueva contraseña',
    confirmPassword: 'Confirmar nueva contraseña',
    changePassword: 'Cambiar contraseña',
    changingPassword: 'Cambiando contraseña...',
    passwordChanged: 'Contraseña actualizada correctamente.',
    passwordMismatch: 'Las contraseñas no coinciden.',
    passwordInvalid:
      'La contraseña no cumple con todos los requisitos de seguridad.',
    passwordError: 'No pudimos cambiar tu contraseña.',
    passwordSecurity: 'Seguridad',
    strengthEmpty: 'Ingresá una contraseña',
    strengthVeryWeak: 'Muy débil',
    strengthWeak: 'Débil',
    strengthGood: 'Buena',
    strengthStrong: 'Fuerte',
    strengthVeryStrong: 'Muy fuerte',
    requirementLength: 'Al menos 8 caracteres',
    requirementUppercase: 'Una mayúscula',
    requirementLowercase: 'Una minúscula',
    requirementNumber: 'Un número',
    requirementSymbol: 'Un símbolo',
    showPassword: 'Mostrar contraseña',
    hidePassword: 'Ocultar contraseña',
    signOut: 'Cerrar sesión',
    loading: 'Cargando perfil...',
  },
}

const allowedImageTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
]

const maximumAvatarSize =
  3 * 1024 * 1024

function getPasswordChecks(
  password: string,
) {
  return {
    length:
      password.length >= 8,
    uppercase:
      /[A-Z]/.test(password),
    lowercase:
      /[a-z]/.test(password),
    number:
      /\d/.test(password),
    symbol:
      /[^A-Za-z0-9]/.test(
        password,
      ),
  }
}

function ProfilePage({
  language,
  onLanguageChange,
  onBack,
  onSignOut,
}: ProfilePageProps) {
  const t =
    translations[language]

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null,
    )

  const [
    userId,
    setUserId,
  ] =
    useState('')

  const [
    email,
    setEmail,
  ] =
    useState('')

  const [
    displayName,
    setDisplayName,
  ] =
    useState('')

  const [
    bio,
    setBio,
  ] =
    useState('')

  const [
    avatarPath,
    setAvatarPath,
  ] =
    useState<string | null>(
      null,
    )

  const [
    avatarUrl,
    setAvatarUrl,
  ] =
    useState('')

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    savingProfile,
    setSavingProfile,
  ] =
    useState(false)

  const [
    uploadingAvatar,
    setUploadingAvatar,
  ] =
    useState(false)

  const [
    profileError,
    setProfileError,
  ] =
    useState('')

  const [
    profileSuccess,
    setProfileSuccess,
  ] =
    useState('')

  const [
    newPassword,
    setNewPassword,
  ] =
    useState('')

  const [
    confirmPassword,
    setConfirmPassword,
  ] =
    useState('')

  const [
    showNewPassword,
    setShowNewPassword,
  ] =
    useState(false)

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] =
    useState(false)

  const [
    changingPassword,
    setChangingPassword,
  ] =
    useState(false)

  const [
    passwordError,
    setPasswordError,
  ] =
    useState('')

  const [
    passwordSuccess,
    setPasswordSuccess,
  ] =
    useState('')

  const passwordChecks =
    getPasswordChecks(
      newPassword,
    )

  const passwordScore =
    Object.values(
      passwordChecks,
    ).filter(Boolean).length

  const passwordValid =
    passwordScore === 5

  const strengthLabel =
    newPassword.length === 0
      ? t.strengthEmpty
      : passwordScore <= 1
        ? t.strengthVeryWeak
        : passwordScore === 2
          ? t.strengthWeak
          : passwordScore === 3
            ? t.strengthGood
            : passwordScore === 4
              ? t.strengthStrong
              : t.strengthVeryStrong

  const loadSignedAvatar =
    async (
      path: string | null,
    ) => {
      if (!path) {
        setAvatarUrl('')
        return
      }

      const {
        data,
        error,
      } =
        await supabase.storage
          .from(
            'campaign-assets',
          )
          .createSignedUrl(
            path,
            60 * 60,
          )

      if (error) {
        console.error(
          'Error al crear URL firmada del avatar:',
          error,
        )

        setAvatarUrl('')
        return
      }

      setAvatarUrl(
        data.signedUrl,
      )
    }

  useEffect(() => {
    const loadProfile =
      async () => {
        setLoading(true)
        setProfileError('')

        try {
          const {
            data:
              userData,
            error:
              userError,
          } =
            await supabase.auth.getUser()

          if (
            userError ||
            !userData.user
          ) {
            throw (
              userError ??
              new Error(
                'Usuario no disponible',
              )
            )
          }

          const currentUser =
            userData.user

          setUserId(
            currentUser.id,
          )

          setEmail(
            currentUser.email ??
            '',
          )

          const {
            data:
              profileData,
            error:
              profileLoadError,
          } =
            await supabase
              .from('profiles')
              .select(
                `
                  id,
                  display_name,
                  avatar_path,
                  bio
                `,
              )
              .eq(
                'id',
                currentUser.id,
              )
              .maybeSingle()

          if (
            profileLoadError
          ) {
            throw profileLoadError
          }

          const profileRow =
            profileData as
              | ProfileRow
              | null

          setDisplayName(
            profileRow
              ?.display_name ??
            (typeof currentUser
              .user_metadata
              ?.display_name ===
            'string'
              ? currentUser
                  .user_metadata
                  .display_name
              : ''),
          )

          setBio(
            profileRow?.bio ??
            '',
          )

          setAvatarPath(
            profileRow
              ?.avatar_path ??
            null,
          )

          await loadSignedAvatar(
            profileRow
              ?.avatar_path ??
            null,
          )
        } catch (error) {
          console.error(
            'Error al cargar perfil:',
            error,
          )

          setProfileError(
            t.loadError,
          )
        } finally {
          setLoading(false)
        }
      }

    void loadProfile()
  }, [t.loadError])

  const saveProfile =
    async (
      event: FormEvent,
    ) => {
      event.preventDefault()

      if (!userId) {
        return
      }

      setSavingProfile(true)
      setProfileError('')
      setProfileSuccess('')

      try {
        const {
          error,
        } =
          await supabase
            .from('profiles')
            .upsert(
              {
                id: userId,
                display_name:
                  displayName
                    .trim() ||
                  null,
                avatar_path:
                  avatarPath,
                bio:
                  bio.trim() ||
                  null,
              },
              {
                onConflict: 'id',
              },
            )

        if (error) {
          throw error
        }

        const {
          error:
            metadataError,
        } =
          await supabase.auth
            .updateUser({
              data: {
                display_name:
                  displayName
                    .trim() ||
                  null,
              },
            })

        if (
          metadataError
        ) {
          console.error(
            'No se pudo sincronizar display_name con Auth:',
            metadataError,
          )
        }

        setProfileSuccess(
          t.profileSaved,
        )
      } catch (error) {
        console.error(
          'Error al guardar perfil:',
          error,
        )

        setProfileError(
          t.profileError,
        )
      } finally {
        setSavingProfile(false)
      }
    }

  const uploadAvatar =
    async (
      event:
        ChangeEvent<HTMLInputElement>,
    ) => {
      const file =
        event.target.files?.[0]

      event.target.value = ''

      if (!file || !userId) {
        return
      }

      setProfileError('')
      setProfileSuccess('')

      if (
        !allowedImageTypes.includes(
          file.type,
        )
      ) {
        setProfileError(
          t.avatarTypeError,
        )
        return
      }

      if (
        file.size >
        maximumAvatarSize
      ) {
        setProfileError(
          t.avatarTooLarge,
        )
        return
      }

      setUploadingAvatar(true)

      try {
        const extension =
          file.type ===
          'image/png'
            ? 'png'
            : file.type ===
                'image/webp'
              ? 'webp'
              : 'jpg'

        const newPath =
          `users/${userId}/avatar-${Date.now()}.${extension}`

        const {
          error:
            uploadError,
        } =
          await supabase.storage
            .from(
              'campaign-assets',
            )
            .upload(
              newPath,
              file,
              {
                cacheControl:
                  '3600',
                upsert: false,
                contentType:
                  file.type,
              },
            )

        if (uploadError) {
          throw uploadError
        }

        const oldPath =
          avatarPath

        const {
          error:
            profileUpdateError,
        } =
          await supabase
            .from('profiles')
            .upsert(
              {
                id: userId,
                display_name:
                  displayName
                    .trim() ||
                  null,
                avatar_path:
                  newPath,
                bio:
                  bio.trim() ||
                  null,
              },
              {
                onConflict: 'id',
              },
            )

        if (
          profileUpdateError
        ) {
          await supabase.storage
            .from(
              'campaign-assets',
            )
            .remove([
              newPath,
            ])

          throw profileUpdateError
        }

        setAvatarPath(
          newPath,
        )

        await loadSignedAvatar(
          newPath,
        )

        if (
          oldPath &&
          oldPath !== newPath
        ) {
          const {
            error:
              removeOldError,
          } =
            await supabase.storage
              .from(
                'campaign-assets',
              )
              .remove([
                oldPath,
              ])

          if (
            removeOldError
          ) {
            console.error(
              'No se pudo borrar el avatar anterior:',
              removeOldError,
            )
          }
        }

        setProfileSuccess(
          t.profileSaved,
        )
      } catch (error) {
        console.error(
          'Error al subir avatar:',
          error,
        )

        setProfileError(
          t.avatarError,
        )
      } finally {
        setUploadingAvatar(false)
      }
    }

  const removeAvatar =
    async () => {
      if (
        !userId ||
        !avatarPath
      ) {
        return
      }

      setUploadingAvatar(true)
      setProfileError('')
      setProfileSuccess('')

      const oldPath =
        avatarPath

      try {
        const {
          error:
            updateError,
        } =
          await supabase
            .from('profiles')
            .update({
              avatar_path:
                null,
            })
            .eq(
              'id',
              userId,
            )

        if (updateError) {
          throw updateError
        }

        const {
          error:
            removeError,
        } =
          await supabase.storage
            .from(
              'campaign-assets',
            )
            .remove([
              oldPath,
            ])

        if (removeError) {
          console.error(
            'No se pudo borrar el archivo del avatar:',
            removeError,
          )
        }

        setAvatarPath(null)
        setAvatarUrl('')
        setProfileSuccess(
          t.profileSaved,
        )
      } catch (error) {
        console.error(
          'Error al eliminar avatar:',
          error,
        )

        setProfileError(
          t.avatarError,
        )
      } finally {
        setUploadingAvatar(false)
      }
    }

  const changePassword =
    async (
      event: FormEvent,
    ) => {
      event.preventDefault()

      setPasswordError('')
      setPasswordSuccess('')

      if (!passwordValid) {
        setPasswordError(
          t.passwordInvalid,
        )
        return
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        setPasswordError(
          t.passwordMismatch,
        )
        return
      }

      setChangingPassword(true)

      try {
        const {
          error,
        } =
          await supabase.auth
            .updateUser({
              password:
                newPassword,
            })

        if (error) {
          throw error
        }

        setNewPassword('')
        setConfirmPassword('')
        setPasswordSuccess(
          t.passwordChanged,
        )
      } catch (error) {
        console.error(
          'Error al cambiar contraseña:',
          error,
        )

        setPasswordError(
          t.passwordError,
        )
      } finally {
        setChangingPassword(false)
      }
    }

  const requirements = [
    [
      'length',
      t.requirementLength,
    ],
    [
      'uppercase',
      t.requirementUppercase,
    ],
    [
      'lowercase',
      t.requirementLowercase,
    ],
    [
      'number',
      t.requirementNumber,
    ],
    [
      'symbol',
      t.requirementSymbol,
    ],
  ] as const

  return (
    <div className="profile-page">
      {/* =================================================
          AMBIENTACIÓN — PERFIL
          ================================================= */}

      <div
        className="profile-ambience"
        aria-hidden="true"
      >
        <div className="profile-ornament profile-ornament-one">
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="profile-ornament profile-ornament-two">
          <span />
          <span />
          <span />
          <span />
        </div>

        <i className="profile-glyph profile-glyph-one">◇</i>
        <i className="profile-glyph profile-glyph-two">△</i>
        <i className="profile-glyph profile-glyph-three">◈</i>

        <div className="profile-dust">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
      <AppHeader
        language={language}
        onLanguageChange={onLanguageChange}
        onOpenProfile={() => {}}
        onSignOut={onSignOut}
        onBack={onBack}
        profileActive
      />

      <main className="profile-main">
        <section className="profile-intro">
          <div className="profile-intro-icon">
            <LuUserRound />
          </div>

          <div>
            <p className="profile-eyebrow">
              {t.eyebrow}
            </p>

            <h1>
              {t.title}
            </h1>

            <p>
              {t.intro}
            </p>
          </div>
        </section>

        {loading ? (
          <section className="profile-loading">
            <div className="app-loading-symbol" />
            <span>
              {t.loading}
            </span>
          </section>
        ) : (
          <div className="profile-grid">
            <form
              className="profile-card"
              onSubmit={
                saveProfile
              }
            >
              <div className="profile-card-heading">
                <LuUserRound />

                <div>
                  <h2>
                    {t.personalInfo}
                  </h2>

                  <p>
                    {t.personalInfoText}
                  </p>
                </div>
              </div>

              {profileError && (
                <div
                  className="profile-feedback profile-feedback-error"
                  role="alert"
                >
                  {profileError}
                </div>
              )}

              {profileSuccess && (
                <div
                  className="profile-feedback profile-feedback-success"
                  role="status"
                >
                  <LuCheck />
                  {profileSuccess}
                </div>
              )}

              <div className="profile-avatar-section">
                <div className="profile-avatar">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={t.avatar}
                    />
                  ) : (
                    <LuUserRound />
                  )}
                </div>

                <div className="profile-avatar-copy">
                  <strong>
                    {t.avatar}
                  </strong>

                  <span>
                    {t.avatarHint}
                  </span>

                  <div className="profile-avatar-actions">
                    <input
                      ref={
                        fileInputRef
                      }
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      hidden
                      onChange={
                        uploadAvatar
                      }
                    />

                    <button
                      type="button"
                      className="profile-secondary-button"
                      disabled={
                        uploadingAvatar
                      }
                      onClick={() =>
                        fileInputRef.current
                          ?.click()
                      }
                    >
                      <LuCamera />
                      <span>
                        {t.uploadAvatar}
                      </span>
                    </button>

                    {avatarPath && (
                      <button
                        type="button"
                        className="profile-danger-button"
                        disabled={
                          uploadingAvatar
                        }
                        onClick={() =>
                          void removeAvatar()
                        }
                      >
                        <LuTrash2 />
                        <span>
                          {t.removeAvatar}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <label className="profile-field">
                <span>
                  {t.displayName}
                </span>

                <input
                  type="text"
                  maxLength={80}
                  value={
                    displayName
                  }
                  placeholder={
                    t.displayNamePlaceholder
                  }
                  onChange={(
                    event,
                  ) =>
                    setDisplayName(
                      event.target
                        .value,
                    )
                  }
                />
              </label>

              <label className="profile-field">
                <span>
                  {t.bio}
                </span>

                <textarea
                  maxLength={300}
                  value={bio}
                  placeholder={
                    t.bioPlaceholder
                  }
                  onChange={(
                    event,
                  ) =>
                    setBio(
                      event.target
                        .value,
                    )
                  }
                />

                <small>
                  {t.bioHint}
                  {' · '}
                  {bio.length}/300
                </small>
              </label>

              <label className="profile-field">
                <span>
                  {t.email}
                </span>

                <input
                  type="email"
                  value={email}
                  readOnly
                />

                <small>
                  {t.emailHint}
                </small>
              </label>

              <div className="profile-card-actions">
                <button
                  type="submit"
                  className="profile-primary-button"
                  disabled={
                    savingProfile ||
                    uploadingAvatar
                  }
                >
                  <LuSave />
                  <span>
                    {savingProfile
                      ? t.savingProfile
                      : t.saveProfile}
                  </span>
                </button>
              </div>
            </form>

            <form
              className="profile-card"
              onSubmit={
                changePassword
              }
            >
              <div className="profile-card-heading">
                <LuShieldCheck />

                <div>
                  <h2>
                    {t.security}
                  </h2>

                  <p>
                    {t.securityText}
                  </p>
                </div>
              </div>

              {passwordError && (
                <div
                  className="profile-feedback profile-feedback-error"
                  role="alert"
                >
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div
                  className="profile-feedback profile-feedback-success"
                  role="status"
                >
                  <LuCheck />
                  {passwordSuccess}
                </div>
              )}

              <label className="profile-field">
                <span>
                  {t.newPassword}
                </span>

                <div className="profile-password-input">
                  <LuLockKeyhole />

                  <input
                    type={
                      showNewPassword
                        ? 'text'
                        : 'password'
                    }
                    autoComplete="new-password"
                    value={
                      newPassword
                    }
                    onChange={(
                      event,
                    ) =>
                      setNewPassword(
                        event.target
                          .value,
                      )
                    }
                  />

                  <button
                    type="button"
                    aria-label={
                      showNewPassword
                        ? t.hidePassword
                        : t.showPassword
                    }
                    onClick={() =>
                      setShowNewPassword(
                        (
                          current,
                        ) =>
                          !current,
                      )
                    }
                  >
                    {showNewPassword
                      ? <LuEyeOff />
                      : <LuEye />}
                  </button>
                </div>
              </label>

              <div className="profile-password-strength">
                <div className="profile-strength-heading">
                  <span>
                    {t.passwordSecurity}
                  </span>

                  <strong>
                    {strengthLabel}
                  </strong>
                </div>

                <div className="profile-strength-bars">
                  {[1, 2, 3, 4, 5].map(
                    (
                      level,
                    ) => (
                      <span
                        key={
                          level
                        }
                        className={
                          passwordScore >=
                          level
                            ? 'active'
                            : ''
                        }
                      />
                    ),
                  )}
                </div>

                <div className="profile-requirements">
                  {requirements.map(
                    ([
                      key,
                      label,
                    ]) => (
                      <div
                        key={key}
                        className={
                          passwordChecks[
                            key
                          ]
                            ? 'valid'
                            : ''
                        }
                      >
                        <LuCheck />
                        <span>
                          {label}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <label className="profile-field">
                <span>
                  {t.confirmPassword}
                </span>

                <div className="profile-password-input">
                  <LuLockKeyhole />

                  <input
                    type={
                      showConfirmPassword
                        ? 'text'
                        : 'password'
                    }
                    autoComplete="new-password"
                    value={
                      confirmPassword
                    }
                    onChange={(
                      event,
                    ) =>
                      setConfirmPassword(
                        event.target
                          .value,
                      )
                    }
                  />

                  <button
                    type="button"
                    aria-label={
                      showConfirmPassword
                        ? t.hidePassword
                        : t.showPassword
                    }
                    onClick={() =>
                      setShowConfirmPassword(
                        (
                          current,
                        ) =>
                          !current,
                      )
                    }
                  >
                    {showConfirmPassword
                      ? <LuEyeOff />
                      : <LuEye />}
                  </button>
                </div>
              </label>

              <div className="profile-card-actions">
                <button
                  type="submit"
                  className="profile-primary-button"
                  disabled={
                    changingPassword
                  }
                >
                  <LuShieldCheck />
                  <span>
                    {changingPassword
                      ? t.changingPassword
                      : t.changePassword}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}

export default ProfilePage
