//  Copyright © 2017 SAP. All rights reserved.

#import "KeychainCertProvider.h"


//do not localize the below string constant
static NSString* ProviderId = @"com.sap.keychaincertprovider";
static NSString* kCertificateLabelParam = @"label";

@implementation KeychainCertProvider   {
    SecIdentityRef _identity;
}

- (void) initialize:(NSDictionary*)option withCompletion:(void(^)(SecIdentityRef identityRef, NSError* error))completion {
    NSError* localError = nil;
    
    [self setParameters:option failedWithError:&localError];
    
    //if certificate is already provisioned, load and return it
    NSError* err = nil;
    SecIdentityRef identity = nil;
    [self getStoredCertificate:&identity error:&err];
    if (identity != nil){
            completion(identity, nil);
    }
    else {
        if (err == nil){
            //certificate not available, prompt user
            UIAlertController* importFailedDialog = [UIAlertController alertControllerWithTitle:[[SMPKeychainCertProviderPlugin getPlugin] getLocalizedResource:@"error"]
                message:[[SMPKeychainCertProviderPlugin getPlugin] getLocalizedResource:@"fail_to_load"] preferredStyle:UIAlertControllerStyleAlert];
            
            [importFailedDialog addAction:[UIAlertAction actionWithTitle:[[SMPKeychainCertProviderPlugin getPlugin] getLocalizedResource:@"ok"] style:UIAlertActionStyleDefault handler:^(UIAlertAction * action) {
                                        completion(nil, err);
                                    }]];
            [SMPKeychainCertProviderPlugin getTopViewController:[SMPKeychainCertProviderPlugin getPlugin].viewController toPresent:importFailedDialog];
        }
        else{
            dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
                completion(nil, err);
            });
        }
    }
}

- (BOOL) setParameters:(NSDictionary*)params failedWithError:(NSError **)error {
    if (params != nil && [params objectForKey:kCertificateLabelParam] != nil ){
        self.certLabel = params[kCertificateLabelParam];
    }
    else{
        self.certLabel = nil;
    }
    return YES;
}

- (NSString*) getProviderID {
    return ProviderId;
}

//method to synchronously get a certificate from saved local copy.
//if saved certicate exists, return true and also set the identityref parameter to the certificate
//If no saved certificate exists, return true and also setting identityRef parameter to nil.
//if error happens during getting the saved certificate, return false with related error, also setting identityRef parameter to nil
- (BOOL) getStoredCertificate:(SecIdentityRef *)pidentityRef error:(NSError**)anError{
    return [SMPKeychainCertProviderPlugin getStoredCertificate:pidentityRef label:self.certLabel error:anError];
}

//keychain provider does not own the certificate, so should not delete it
- (BOOL) deleteStoredCertificateWithError:(NSError**)anError{
    return YES;
}

- (NSDictionary*) getParameters{
    NSDictionary *param = [NSDictionary dictionaryWithObjectsAndKeys:
                           self.certLabel, kCertificateLabelParam,
                           nil];
    return param;
}

@end
