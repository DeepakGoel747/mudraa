import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { Button } from '../../components/common/Button';
import { authService } from '../../services/authService';

export const OTPVerificationScreen = ({ route, navigation }: any) => {
    const { email } = route.params;
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const otpInputs = useRef<Array<TextInput | null>>([]);

    const handleOtpChange = (value: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next input if value is entered
        if (value && index < 5) {
            otpInputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        // Move to previous input on backspace
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        if (otp.some(digit => !digit)) {
            Alert.alert('Error', 'Please enter the complete OTP');
            return;
        }

        try {
            setIsLoading(true);
            const otpCode = otp.join('');
            await authService.verifyOTP(email, otpCode);
            navigation.navigate('ResetPassword', { email, otp: otpCode });
        } catch (error: any) {
            Alert.alert('Verification Error', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        try {
            setIsLoading(true);
            await authService.resendOTP(email);
            Alert.alert('Success', 'OTP has been resent to your email');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    <Text style={styles.title}>Verify Email</Text>
                    <Text style={styles.subtitle}>
                        Enter the 6-digit code sent to {email}
                    </Text>

                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => {
                                    otpInputs.current[index] = ref;
                                }}
                                style={styles.otpInput}
                                value={digit}
                                onChangeText={(value) => handleOtpChange(value, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                keyboardType="number-pad"
                                maxLength={1}
                                selectTextOnFocus
                            />
                        ))}
                    </View>

                    <Button
                        title="Verify"
                        onPress={handleVerify}
                        loading={isLoading}
                        style={styles.verifyButton}
                        disabled={otp.some((digit) => !digit)}
                    />

                    <View style={styles.resendContainer}>
                        <Text style={styles.resendText}>
                            Didn't receive the code?{' '}
                        </Text>
                        <TouchableOpacity onPress={handleResendOTP}>
                            <Text style={styles.resendLink}>Resend</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.text.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.text.secondary,
        marginBottom: 32,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    otpInput: {
        width: 45,
        height: 45,
        borderRadius: 8,
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
        color: COLORS.text.primary,
        fontSize: 20,
        textAlign: 'center',
    },
    verifyButton: {
        marginBottom: 24,
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    resendText: {
        color: COLORS.text.secondary,
        fontSize: 14,
    },
    resendLink: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '600',
    },
}); 